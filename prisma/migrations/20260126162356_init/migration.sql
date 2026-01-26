/*
  Warnings:

  - You are about to drop the column `categoryId` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_categoryId_fkey";

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";
