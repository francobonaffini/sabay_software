-- CreateEnum
CREATE TYPE "GuestPassStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'USED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GuestPass" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "reservationId" INTEGER,
    "status" "GuestPassStatus" NOT NULL DEFAULT 'AVAILABLE',
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "GuestPass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestPass_reservationId_key" ON "GuestPass"("reservationId");

-- CreateIndex
CREATE INDEX "GuestPass_studentId_idx" ON "GuestPass"("studentId");

-- AddForeignKey
ALTER TABLE "GuestPass" ADD CONSTRAINT "GuestPass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
