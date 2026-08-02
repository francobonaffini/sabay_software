/*
  Warnings:

  - You are about to drop the column `reservationId` on the `GuestPass` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GuestPass_reservationId_key";

-- AlterTable
ALTER TABLE "GuestPass" DROP COLUMN "reservationId";
