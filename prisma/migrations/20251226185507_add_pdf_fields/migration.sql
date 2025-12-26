-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "hasHealthPlan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responsibleMember" TEXT;
