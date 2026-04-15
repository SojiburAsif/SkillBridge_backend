import { prisma } from "../../lib/prisma";

const getMyNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};

const markAsRead = async (notificationId: string, userId: string) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found or unauthorized");
    }

    return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
};

const markAllAsRead = async (userId: string) => {
    const result = await prisma.notification.updateMany({
        where: {
            userId: userId,
            isRead: false,
        },
        data: { isRead: true },
    });

    return { updatedCount: result.count };
};

const deleteNotification = async (notificationId: string, userId: string) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
        throw new Error("Notification not found or unauthorized");
    }

    return await prisma.notification.delete({
        where: { id: notificationId },
    });
};

export const notificationService = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};