import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

function normalizeCategoryName(name: string) {
  return String(name ?? "").trim();
}

function isInvalidCategoryName(name: string) {
  const n = normalizeCategoryName(name);
  const low = n.toLowerCase();
  return !n || low === "unknown" || low === "undefined" || low === "null";
}

// Create Category (Admin Only)
const createCategory = async (payload: { name: string; title?: string; icon?: string }) => {
  if (isInvalidCategoryName(payload?.name)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category name is invalid.");
  }

  const existingCategory = await prisma.category.findFirst({
    where: { name: normalizeCategoryName(payload.name) },
  });

  if (existingCategory) {
    throw new AppError(StatusCodes.CONFLICT, "Category already exists with this name.");
  }

  const newCategory = await prisma.category.create({
    data: {
      name: normalizeCategoryName(payload.name),
      ...(payload.icon && { icon: payload.icon.trim() }),
    },
  });

  return newCategory;
};

// Get All Categories (Public)
const getAllCategories = async () => {
  return await prisma.category.findMany({
    where: {
      NOT: [{ name: { equals: "Unknown", mode: "insensitive" } }],
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Update Category (Admin Only)
const updateCategory = async (categoryId: string, payload: { name?: string; title?: string; icon?: string }) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!categoryExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found.");
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(payload.name && !isInvalidCategoryName(payload.name) && { name: normalizeCategoryName(payload.name) }),
      ...(payload.icon !== undefined && { icon: payload.icon?.trim() }),
    },
  });

  return updatedCategory;
};

// Delete Category (Admin Only)
const deleteCategory = async (categoryId: string) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { tutors: true }
  });

  if (!categoryExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found.");
  }

  if (categoryExists.tutors.length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Cannot delete category as it is currently assigned to one or more tutors.");
  }

  return await prisma.category.delete({
    where: { id: categoryId },
  });
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};