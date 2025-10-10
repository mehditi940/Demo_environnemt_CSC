-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'surgeon', 'admin', 'system');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('patient', 'surgeon', 'demo');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'user',
    "deleted" TEXT NOT NULL DEFAULT 'false',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" TEXT NOT NULL,
    "nummer" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "patient" TEXT,
    "type" "public"."RoomType" NOT NULL DEFAULT 'patient',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."connection" (
    "id" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "startedBy" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT,
    "mimeType" TEXT,
    "addedBy" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users_to_groups" (
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "users_to_groups_pkey" PRIMARY KEY ("userId","roomId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nummer_key" ON "public"."patients"("nummer");

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_patient_fkey" FOREIGN KEY ("patient") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_startedBy_fkey" FOREIGN KEY ("startedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."connection" ADD CONSTRAINT "connection_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_to_groups" ADD CONSTRAINT "users_to_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_to_groups" ADD CONSTRAINT "users_to_groups_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
