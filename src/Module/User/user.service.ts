import { $Enums } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// Get all users
const AllUser = async () => {
    return await prisma.user.findMany();
};

// Get single user by ID
const getSingleUser = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
        }
    });
};



const updateUserStatus = async (userId: string, newStatus: $Enums.UserStatus) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
        }
    });
};

export const UserServices = {
    AllUser,
    getSingleUser,
    updateUserStatus
};
