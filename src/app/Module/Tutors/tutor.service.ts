/* tutor.service.ts
   - Tutor profile create/update/get logic with slots support
   - Comments explain what changed and why
*/

import { TutorProfile } from "../../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

/* Slot input type (front-end will send date + time strings) */
type SlotInput = {
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
};

const updateTutorProfile = async (
    data: Partial<Omit<TutorProfile, "id" | "createdAt" | "updatedAt" | "userId" | "categoryId">> & { categoryName?: string, name?: string, phone?: string, image?: string, categoryId?: string },
    userId: string,
    slots?: SlotInput[]
) => {
    let categoryIdToUse: string | undefined = data.categoryId;

    if (data.categoryName && !categoryIdToUse) {
        const catName = String(data.categoryName ?? "").trim();
        const low = catName.toLowerCase();
        if (catName && low !== "unknown" && low !== "undefined" && low !== "null") {
            const category = await prisma.category.findFirst({ where: { name: catName } });
            if (!category) throw new Error("Category does not exist");
            categoryIdToUse = category.id;
        }
    }

    const { name, phone, image, categoryName, categoryId, ...tutorFields } = data;

    // Update user info if any
    if (name !== undefined || phone !== undefined || image !== undefined) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(phone !== undefined && { phone }),
                ...(image !== undefined && { image })
            }
        });
    }

    let result;
    const existingProfile = await prisma.tutorProfile.findUnique({ where: { userId } });

    const fields: any = { ...tutorFields };
    if (fields.experience !== undefined) fields.experience = String(fields.experience);
    if (fields.price !== undefined) fields.price = Number(fields.price);
    if (categoryIdToUse) fields.categoryId = categoryIdToUse;

    // prepare slots payload if submitted
    const slotsPayload = Array.isArray(slots) ? slots.map(s => ({
        date: new Date(s.date),
        startTime: new Date(`${s.date}T${s.startTime}:00Z`),
        endTime: new Date(`${s.date}T${s.endTime}:00Z`)
    })) : undefined;

    if (existingProfile) {
        // UPDATE existing
        result = await prisma.tutorProfile.update({
            where: { userId },
            data: {
                ...fields,
                ...(slotsPayload && {
                    // optionally, you might want to clear old slots or just add. 
                    // Let's add them to the existing slots for simplicity
                    tutorSlots: { create: slotsPayload }
                })
            },
            include: { tutorSlots: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, category: true }
        });
    } else {
        // CREATE new (Upsert behavior)
        if (!fields.bio) fields.bio = "";
        if (fields.price === undefined) fields.price = 0;
        if (!fields.experience) fields.experience = "";

        result = await prisma.tutorProfile.create({
            data: {
                ...fields,
                userId,
                ...(slotsPayload && {
                    tutorSlots: { create: slotsPayload }
                })
            },
            include: { tutorSlots: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, category: true }
        });
    }

    return result;
};


const getAlltetutor = async (payload: {
    search?: string;
    categoryId?: string;
    rating?: number;
    price?: number;
    page?: number;
    limit?: number;
}) => {
    const filters: any = { status: "ACTIVE" };

    // search tries bio, experience, rating (gte) and price (lte)
    if (payload.search) {
        const maybeNumber = Number(payload.search);
        filters.OR = [
            { bio: { contains: payload.search, mode: "insensitive" } },
            { experience: { contains: payload.search, mode: "insensitive" } },
            ...(!isNaN(maybeNumber) ? [{ rating: { gte: maybeNumber } }, { price: { lte: maybeNumber } }] : [])
        ];
    }

    if (payload.categoryId) {
        // Support both legacy single categoryId and new multi-category relation
        filters.OR = [
            ...(Array.isArray(filters.OR) ? filters.OR : []),
            { categoryId: payload.categoryId },
            { categories: { some: { categoryId: payload.categoryId } } },
        ];
    }
    if (payload.rating !== undefined) filters.rating = { gte: payload.rating };
    if (payload.price !== undefined) filters.price = { lte: payload.price };

    const page = payload.page && payload.page > 0 ? payload.page : 1;
    const limit = payload.limit && payload.limit > 0 ? payload.limit : 10;
    const skip = (page - 1) * limit;

    const total = await prisma.tutorProfile.count({ where: filters });
    
    const result = await prisma.tutorProfile.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
            category: true,
            user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } },
            tutorSlots: {
                where: { isBooked: false } // Only show unbooked slots
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Attach multi-categories if available (without relying on generated Prisma types)
    try {
        const m = (prisma as any).tutorProfileCategory;
        if (m?.findMany) {
            const ids = result.map((x) => x.id);
            const links = await m.findMany({
                where: { tutorProfileId: { in: ids } },
                include: { category: true },
                orderBy: { order: "asc" },
            });
            const byTutor: Record<string, any[]> = {};
            links.forEach((l: any) => {
                const tid = String(l.tutorProfileId);
                (byTutor[tid] ||= []).push(l);
            });
            (result as any).forEach((t: any) => {
                t.categories = (byTutor[String(t.id)] || []).slice(0, 4);
            });
        }
    } catch {
        // ignore
    }

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        result
    };
};

/**
 * getTutorProfileById
 * - returns tutor + unbooked slots + user + category
 */
const getTutorProfileById = async (tutorId: string) => {
    const result = await prisma.tutorProfile.findUnique({
        where: { id: tutorId },
        include: { 
            category: true, 
            user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, 
            tutorSlots: { where: { isBooked: false } } 
        }
    });

    try {
        const m = (prisma as any).tutorProfileCategory;
        if (m?.findMany && result?.id) {
            const links = await m.findMany({
                where: { tutorProfileId: result.id },
                include: { category: true },
                orderBy: { order: "asc" },
            });
            (result as any).categories = links.slice(0, 4);
        }
    } catch {
        // ignore
    }

    return result;
};

/* Categories helpers */
const getCategoriesAll = async () => await prisma.category.findMany();

const creaCategory = async (category: { name: string }) => {
    if (!category?.name?.trim()) throw new Error("Category name is required");

    const nameTrimmed = category.name.trim();
    const low = nameTrimmed.toLowerCase();
    if (low === "unknown" || low === "undefined" || low === "null") {
        throw new Error("Category name is invalid");
    }

    let created = await prisma.category.findFirst({ where: { name: nameTrimmed } });
    if (!created) {
        created = await prisma.category.create({ data: { name: nameTrimmed } });
    }

    return created;
};

const deleteCategory = async (categoryId: string) => {
    // Check if category is used by any tutor
    const tutorsInCat = await prisma.tutorProfile.findFirst({ where: { categoryId } });
    if (tutorsInCat) throw new Error("Cannot delete category as it is currently assigned to one or more tutors.");

    return await prisma.category.delete({
        where: { id: categoryId }
    });
};


const getMyProfiletetutor = async (payload: { userId: string }) => {
    return prisma.tutorProfile.findUnique({
        where: { userId: payload.userId },
        include: { category: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, tutorSlots: true }
    });
};

/* export */
export const tutorServices = {
    updateTutorProfile,
    getAlltetutor,
    getTutorProfileById,
    getCategoriesAll,
    creaCategory,
    deleteCategory,
    getMyProfiletetutor
};
