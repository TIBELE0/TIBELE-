-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('QCM', 'QCD');

-- CreateEnum
CREATE TYPE "public"."TrainingMode" AS ENUM ('QCM', 'QCD', 'all');

-- CreateEnum
CREATE TYPE "public"."TrainingSessionStatus" AS ENUM ('in_progress', 'completed', 'abandoned');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "matricule" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "studyYear" TEXT,
    "major" TEXT NOT NULL,
    "matriculeValidated" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionExpiryDate" TIMESTAMP(3),
    "refreshTokenHash" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "supabaseUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalGroup" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pathology" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "examinations" TEXT NOT NULL,
    "referentialDiagnosis" TEXT NOT NULL,
    "onSiteTreatment" TEXT NOT NULL,
    "dischargeOrder" TEXT NOT NULL,
    "prevention" TEXT NOT NULL,
    "references" TEXT,
    "imageUrl" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "groupe" TEXT NOT NULL DEFAULT 'Autres',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pathology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Topic" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "pathologyId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentMessageId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "questionText" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "options" JSONB NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pathologyId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAnswer" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "pathologyId" TEXT,

    CONSTRAINT "UserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainingSession" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "mode" "public"."TrainingMode" NOT NULL,
    "limit" INTEGER NOT NULL,
    "status" "public"."TrainingSessionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "totalQuestions" INTEGER NOT NULL,
    "answeredCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "scorePercentage" DOUBLE PRECISION NOT NULL,
    "durationSeconds" INTEGER,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteSetting" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "key" TEXT NOT NULL DEFAULT 'global',
    "siteName" TEXT NOT NULL DEFAULT 'TIBELE Admin',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@tibele.local',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "registrationsOpen" BOOLEAN NOT NULL DEFAULT true,
    "messageMaintenance" TEXT NOT NULL DEFAULT 'Maintenance en cours. Merci de revenir plus tard.',
    "primaryColor" TEXT NOT NULL DEFAULT '#0b3b5a',
    "secondaryColor" TEXT NOT NULL DEFAULT '#2e8b57',
    "donationUrl" TEXT NOT NULL DEFAULT 'https://pay.djamo.com/o5y88',
    "donationPopupIntervalMinutes" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "legacyMongoId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyMongoId_key" ON "public"."User"("legacyMongoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_matricule_key" ON "public"."User"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "public"."User"("supabaseUserId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalGroup_legacyMongoId_key" ON "public"."MedicalGroup"("legacyMongoId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalGroup_name_key" ON "public"."MedicalGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalGroup_slug_key" ON "public"."MedicalGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Pathology_legacyMongoId_key" ON "public"."Pathology"("legacyMongoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pathology_slug_key" ON "public"."Pathology"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_legacyMongoId_key" ON "public"."Topic"("legacyMongoId");

-- CreateIndex
CREATE INDEX "Topic_isPinned_idx" ON "public"."Topic"("isPinned");

-- CreateIndex
CREATE INDEX "Topic_authorId_idx" ON "public"."Topic"("authorId");

-- CreateIndex
CREATE INDEX "Topic_pathologyId_idx" ON "public"."Topic"("pathologyId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_legacyMongoId_key" ON "public"."Message"("legacyMongoId");

-- CreateIndex
CREATE INDEX "Message_topicId_idx" ON "public"."Message"("topicId");

-- CreateIndex
CREATE INDEX "Message_authorId_idx" ON "public"."Message"("authorId");

-- CreateIndex
CREATE INDEX "Message_parentMessageId_idx" ON "public"."Message"("parentMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_legacyMongoId_key" ON "public"."Question"("legacyMongoId");

-- CreateIndex
CREATE INDEX "Question_pathologyId_idx" ON "public"."Question"("pathologyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_legacyMongoId_key" ON "public"."UserAnswer"("legacyMongoId");

-- CreateIndex
CREATE INDEX "UserAnswer_userId_idx" ON "public"."UserAnswer"("userId");

-- CreateIndex
CREATE INDEX "UserAnswer_questionId_idx" ON "public"."UserAnswer"("questionId");

-- CreateIndex
CREATE INDEX "UserAnswer_pathologyId_idx" ON "public"."UserAnswer"("pathologyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnswer_userId_questionId_key" ON "public"."UserAnswer"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_legacyMongoId_key" ON "public"."TrainingSession"("legacyMongoId");

-- CreateIndex
CREATE INDEX "TrainingSession_userId_idx" ON "public"."TrainingSession"("userId");

-- CreateIndex
CREATE INDEX "TrainingSession_status_idx" ON "public"."TrainingSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_legacyMongoId_key" ON "public"."SiteSetting"("legacyMongoId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "public"."SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_legacyMongoId_key" ON "public"."AuditLog"("legacyMongoId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "public"."AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "public"."AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resource_idx" ON "public"."AuditLog"("resource");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Topic" ADD CONSTRAINT "Topic_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "public"."Pathology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "public"."Pathology"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnswer" ADD CONSTRAINT "UserAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnswer" ADD CONSTRAINT "UserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAnswer" ADD CONSTRAINT "UserAnswer_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "public"."Pathology"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingSession" ADD CONSTRAINT "TrainingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

