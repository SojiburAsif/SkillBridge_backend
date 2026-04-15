import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

const toggleWishlist = async (studentId: string, tutorProfileId: string) => {
  const existingWishlist = await prisma.wishlist.findFirst({
    where: {
      studentId,
      tutorProfileId,
    },
  });

  if (existingWishlist) {
    // Remove if exists
    await prisma.wishlist.delete({
      where: {
        id: existingWishlist.id,
      },
    });
    return { message: 'Tutor removed from wishlist', data: null };
  } else {
    // Add to wishlist
    const newWishlist = await prisma.wishlist.create({
      data: {
        studentId,
        tutorProfileId,
      },
    });
    return { message: 'Tutor added to wishlist', data: newWishlist };
  }
};

const getMyWishlist = async (studentId: string) => {
  return await prisma.wishlist.findMany({
    where: {
      studentId,
    },
    include: {
      tutorProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const WishlistService = {
  toggleWishlist,
  getMyWishlist,
};
