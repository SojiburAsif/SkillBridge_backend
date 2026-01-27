import { prisma } from "../../lib/prisma"


const AllUser = async () => {
    const result = await prisma.user.findMany()
    return result
}



export const UserServices = {
    AllUser
}