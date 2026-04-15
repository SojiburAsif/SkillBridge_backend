import { prisma } from "../../lib/prisma";

const getMySessions = async (userId: string) => {
    return prisma.session.findMany({
        where: { userId },
        include: { user: { select: { email: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

const getAllSessions = async () => {
    return prisma.session.findMany({
        include: { user: { select: { email: true, name: true, role: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

const deleteSession = async (sessionId: string, userId: string, role: string) => {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error("Session not found");

    // Allow deletion if the user owns the session OR if the user is an ADMIN
    if (session.userId !== userId && role !== 'ADMIN') {
        throw new Error("You do not have permission to terminate this session");
    }

    await prisma.session.delete({ where: { id: sessionId } });
    return null;
};

export const SessionService = {
    getMySessions,
    getAllSessions,
    deleteSession
};