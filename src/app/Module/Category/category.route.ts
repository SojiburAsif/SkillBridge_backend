import express from 'express';
import { auth, UserRole } from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { createCategoryValidationSchema, updateCategoryValidationSchema } from './category.validation';
import { CategoryController } from './category.controller';

const router = express.Router();

// Get all categories (Publicly accessible)
router.get('/', CategoryController.getAllCategories);

// Create a new category (Admin Only)
router.post(
  '/',
  auth(UserRole.ADMIN),
  validateRequest(createCategoryValidationSchema),
  CategoryController.createCategory
);

// Update a category (Admin Only)
router.patch(
  '/:categoryId',
  auth(UserRole.ADMIN),
  validateRequest(updateCategoryValidationSchema),
  CategoryController.updateCategory
);

// Delete a category (Admin Only)
router.delete(
  '/:categoryId',
  auth(UserRole.ADMIN),
  CategoryController.deleteCategory
);

export const categoryRouter = router;