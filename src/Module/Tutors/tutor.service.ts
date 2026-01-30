import { TutorProfile } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"




const createtutor = async (data: Omit<TutorProfile, 'createdAt' | 'updatedAt' | 'userId'>, userId: string) => {

    const existingTutor = await prisma.tutorProfile.findUnique({
        where: { userId }
    })

    if (existingTutor) {
        return " Tutor profile already exists for this user."
    }

    const result = await prisma.tutorProfile.create({
        data: {
            ...data,
            userId: userId
        }
    })
    return result
}


const updateTutorProfile = async (
    data: Partial<Omit<TutorProfile, "id" | "createdAt" | "updatedAt" | "userId" | "categoryId">> & { categoryName?: string },
    userId: string
) => {
    let categoryId: string | undefined

    if (data.categoryName) {
        const category = await prisma.category.findUnique({
            where: { name: data.categoryName }
        })
        if (!category) {
            throw new Error("Category does not exist")
        }
        categoryId = category.id
    }

    const fields: any = { ...data }
    if (fields.experience !== undefined) {
        fields.experience = String(fields.experience)
    }
    if (fields.price !== undefined) {
        fields.price = Number(fields.price)
    }
    if (categoryId) {
        fields.categoryId = categoryId
    }

    const result = await prisma.tutorProfile.update({
        where: { userId },
        data: fields
    })

    return result
}

const getAlltetutor = async (payload: {
    search?: string,
    categoryId?: string
}) => {
    const filters: any = {}


    if (payload.search) {
        filters.OR = [
            {
                bio: {
                    contains: payload.search,
                    mode: 'insensitive'
                }
            },
            {
                experience: {
                    contains: payload.search,
                    mode: 'insensitive'
                }
            },
            {
                rating: {
                    gte: isNaN(Number(payload.search)) ? undefined : Number(payload.search)
                }
            },
            {
                price: {
                    lte: isNaN(Number(payload.search)) ? undefined : Number(payload.search)
                }
            }
        ]
    }

    if (payload.categoryId) {
        filters.categoryId = payload.categoryId
    }

    const result = await prisma.tutorProfile.findMany({
        where: filters,
        include: {
            category: true
            ,
            user: true
        }
    })

    return result
}


const getTutorProfileById = async (tutorId: string) => {

    const result = await prisma.tutorProfile.findUnique({
        where: {
            id: tutorId,
        },
        include: {
            category: true,
            user: true,
        },
    });

    return result


};

const getCategoriesAll = async () => {
    const result = await prisma.category.findMany()
    return result
}

export const tutorServices = {
    createtutor,
    updateTutorProfile,
    getAlltetutor,
    getTutorProfileById,
    getCategoriesAll
}



