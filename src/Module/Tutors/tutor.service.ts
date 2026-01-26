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

const getTutorProfile = async (payload: { search: string | undefined }) => {

    const result = await prisma.tutorProfile.findMany({
        where: {
            OR: [
                {
                    bio: {
                        contains: payload.search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    experience: {
                        contains: payload.search as string,
                        mode: 'insensitive'
                    }
                },
                {
                    rating: {
                        gte: Number(payload.search)   // যদি search value number হয়
                    }
                },
                {
                    price: {
                        lte: Number(payload.search)   // উদাহরণ: search value দিয়ে price filter
                    }
                }
            ]
        }
    })

    return result
}

export const tutorServices = {
    createtutor,
    updateTutorProfile,
    getTutorProfile
}