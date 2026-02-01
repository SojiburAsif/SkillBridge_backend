/* tutor.service.ts
   - Tutor profile create/update/get logic with slots support
   - Comments explain what changed and why
*/

import { TutorProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

/* Slot input type (front-end will send date + time strings) */
type SlotInput = {
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
};

/**
 * createtutor
 * - Creates a TutorProfile for the given userId.
 * - Accepts optional `slots` array for bulk slot creation.
 * - Uses nested create: slots: { create: [...] }
 */
const createtutor = async (
    tutorData: Omit<TutorProfile, "id" | "createdAt" | "updatedAt" | "userId" | "categoryId">,
    userId: string,
    slots?: SlotInput[] // optional
) => {
    // check existing
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { userId } });
    if (existingTutor) {
        // returning string here like previous code; you may want to throw instead
        return "Tutor profile already exists for this user.";
    }

    // build nested create array only if slots is an array
    const slotsCreatePayload = Array.isArray(slots)
        ? slots.map(s => ({
            date: new Date(s.date), // store date at midnight (UTC)
            startTime: new Date(`${s.date}T${s.startTime}:00Z`),
            endTime: new Date(`${s.date}T${s.endTime}:00Z`)
        }))
        : [];

    const result = await prisma.tutorProfile.create({
        data: {
            ...tutorData,
            userId,
            // if no slots, create: [] works fine
            tutorSlots: {
                create: slotsCreatePayload
            }
        },
        // include relations so frontend gets full object (slots, user, category)
        include: {
            tutorSlots: true,
            user: true,
            category: true
        }
    });

    return result;
};


const updateTutorProfile = async (
    data: Partial<Omit<TutorProfile, "id" | "createdAt" | "updatedAt" | "userId" | "categoryId">> & { categoryName?: string },
    userId: string
) => {
    let categoryId: string | undefined;

    if (data.categoryName) {
        const category = await prisma.category.findUnique({ where: { name: data.categoryName } });
        if (!category) throw new Error("Category does not exist");
        categoryId = category.id;
    }

    const fields: any = { ...data };
    if (fields.experience !== undefined) fields.experience = String(fields.experience);
    if (fields.price !== undefined) fields.price = Number(fields.price);
    if (categoryId) fields.categoryId = categoryId;

    const result = await prisma.tutorProfile.update({
        where: { userId },
        data: fields,
        include: { tutorSlots: true, user: true, category: true } // return slots so frontend has updated view
    });

    return result;
};


const getAlltetutor = async (payload: {
    search?: string;
    categoryId?: string;
    rating?: number;
    price?: number;
}) => {
    const filters: any = {};

    // search tries bio, experience, rating (gte) and price (lte)
    if (payload.search) {
        const maybeNumber = Number(payload.search);
        filters.OR = [
            { bio: { contains: payload.search, mode: "insensitive" } },
            { experience: { contains: payload.search, mode: "insensitive" } },
            { rating: !isNaN(maybeNumber) ? { gte: maybeNumber } : undefined },
            { price: !isNaN(maybeNumber) ? { lte: maybeNumber } : undefined }
        ].filter(Boolean); // remove undefined entries
    }

    if (payload.categoryId) filters.categoryId = payload.categoryId;
    if (payload.rating !== undefined) filters.rating = { gte: payload.rating };
    if (payload.price !== undefined) filters.price = { lte: payload.price };

    const result = await prisma.tutorProfile.findMany({
        where: filters,
        include: {
            category: true,
            user: true,
            tutorSlots: true // include slots so frontend can show availability
        }
    });

    return result;
};

/**
 * getTutorProfileById
 * - returns tutor + slots + user + category
 */
const getTutorProfileById = async (tutorId: string) => {
    const result = await prisma.tutorProfile.findUnique({
        where: { id: tutorId },
        include: { category: true, user: true, tutorSlots: true }
    });

    return result;
};

/* Categories helpers */
const getCategoriesAll = async () => await prisma.category.findMany();

const creaCategory = async (category: { name: string }) => {
    if (!category?.name?.trim()) throw new Error("Category name is required");

    const created = await prisma.category.upsert({
        where: { name: category.name.trim() },
        update: {},
        create: { name: category.name.trim() }
    });

    return created;
};


const getMyProfiletetutor = async (payload: { userId: string }) => {
    // যদি আপনার schema এ userId unique হয় তাহলে findUnique ব্যবহার করুন। না হলে findFirst ঠিক আছে।
    return prisma.tutorProfile.findUnique({
        where: { userId: payload.userId },
    });
};

/* export */
export const tutorServices = {
    createtutor,
    updateTutorProfile,
    getAlltetutor,
    getTutorProfileById,
    getCategoriesAll,
    creaCategory,
    getMyProfiletetutor
};
