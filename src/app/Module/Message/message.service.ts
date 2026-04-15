import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

const sendMessage = async (senderId: string, receiverId: string, text: string) => {
  if (senderId === receiverId) {
    throw new AppError(400, 'Cannot send message to yourself');
  }
  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      text,
    },
  });

  // Create a notification for the receiver
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true, email: true },
    });
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New message",
        message: `${sender?.name ?? "Someone"}: ${String(text).slice(0, 80)}`,
        type: "MESSAGE",
        metadata: {
          kind: "MESSAGE",
          otherUserId: senderId,
          messageId: message.id,
        } as any,
      },
    });
  } catch {
    // best-effort; message send should still succeed
  }

  return message;
};

const getConversation = async (userId: string, otherUserId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Messenger-style: entering chat marks incoming messages as read
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return messages;
};

const getUnreadCount = async (userId: string) => {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      readAt: null,
    },
  });
  return { count };
};

export const MessageService = {
  sendMessage,
  getConversation,
  getUnreadCount,
};
