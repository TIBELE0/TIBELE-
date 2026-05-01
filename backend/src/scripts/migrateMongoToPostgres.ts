import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PrismaClient, QuestionType, TrainingMode, TrainingSessionStatus, UserRole } from '@prisma/client';
import { User } from '../models/User';
import { MedicalGroup } from '../models/MedicalGroup';
import { Pathology } from '../models/Pathology';
import { Topic } from '../models/Topic';
import { Message } from '../models/Message';
import { Question } from '../models/Question';
import { UserAnswer } from '../models/UserAnswer';
import { TrainingSession } from '../models/TrainingSession';
import { SiteSetting } from '../models/SiteSetting';
import { AuditLog } from '../models/AuditLog';

dotenv.config();

const prisma = new PrismaClient();

const connectMongo = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI manquant. Impossible de lire les donnees legacy MongoDB.');
  }

  await mongoose.connect(mongoUri);
};

const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
};

const normalizeQuestionType = (value: string): QuestionType => {
  return value === 'QCD' ? QuestionType.QCD : QuestionType.QCM;
};

const normalizeTrainingMode = (value: string): TrainingMode => {
  if (value === 'QCM') return TrainingMode.QCM;
  if (value === 'QCD') return TrainingMode.QCD;
  return TrainingMode.all;
};

const normalizeTrainingStatus = (value: string): TrainingSessionStatus => {
  if (value === 'completed') return TrainingSessionStatus.completed;
  if (value === 'abandoned') return TrainingSessionStatus.abandoned;
  return TrainingSessionStatus.in_progress;
};

const normalizeUserRole = (value: string): UserRole => {
  return value === 'admin' ? UserRole.admin : UserRole.user;
};

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL manquant. Impossible de migrer vers PostgreSQL.');
  }

  await connectMongo();
  await prisma.$connect();

  const userMap = new Map<string, string>();
  const pathologyMap = new Map<string, string>();
  const topicMap = new Map<string, string>();
  const questionMap = new Map<string, string>();
  const fallbackPasswordHash = await bcrypt.hash('TempPass123', 10);

  console.log('Migration users...');
  const users = await User.find().select('+refreshTokenHash +refreshTokenExpiresAt').lean();
  for (const user of users) {
    const legacyMongoId = String(user._id);
    const normalizedEmail = user.email || `legacy-${legacyMongoId}@tibele.local`;
    const normalizedMatricule = user.matricule || `MIG${legacyMongoId.slice(-6).toUpperCase()}`;
    const normalizedSchool = user.school || 'Non renseigne';
    const normalizedMajor = user.major || 'Non renseigne';
    const normalizedRole = normalizeUserRole(user.role || 'user');
    const normalizedPasswordHash = user.password || fallbackPasswordHash;

    const upserted = await prisma.user.upsert({
      where: { legacyMongoId },
      update: {
        email: normalizedEmail,
        passwordHash: normalizedPasswordHash,
        fullName: user.fullName || null,
        matricule: normalizedMatricule,
        school: normalizedSchool,
        studyYear: user.studyYear || null,
        major: normalizedMajor,
        matriculeValidated: Boolean(user.matriculeValidated),
        isBanned: Boolean(user.isBanned),
        role: normalizedRole,
        isPaid: Boolean(user.isPaid),
        subscriptionExpiryDate: user.subscriptionExpiryDate || null,
        refreshTokenHash: user.refreshTokenHash || null,
        refreshTokenExpiresAt: user.refreshTokenExpiresAt || null,
      },
      create: {
        legacyMongoId,
        email: normalizedEmail,
        passwordHash: normalizedPasswordHash,
        fullName: user.fullName || null,
        matricule: normalizedMatricule,
        school: normalizedSchool,
        studyYear: user.studyYear || null,
        major: normalizedMajor,
        matriculeValidated: Boolean(user.matriculeValidated),
        isBanned: Boolean(user.isBanned),
        role: normalizedRole,
        isPaid: Boolean(user.isPaid),
        subscriptionExpiryDate: user.subscriptionExpiryDate || null,
        refreshTokenHash: user.refreshTokenHash || null,
        refreshTokenExpiresAt: user.refreshTokenExpiresAt || null,
      },
    });

    userMap.set(legacyMongoId, upserted.id);
  }

  console.log('Migration medical groups...');
  const groups = await MedicalGroup.find().lean();
  for (const group of groups) {
    const legacyMongoId = String(group._id);
    await prisma.medicalGroup.upsert({
      where: { legacyMongoId },
      update: {
        name: group.name,
        slug: group.slug,
        description: group.description || null,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
      create: {
        legacyMongoId,
        name: group.name,
        slug: group.slug,
        description: group.description || null,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    });
  }

  console.log('Migration pathologies...');
  const pathologies = await Pathology.find().lean();
  for (const pathology of pathologies) {
    const legacyMongoId = String(pathology._id);
    const upserted = await prisma.pathology.upsert({
      where: { legacyMongoId },
      update: {
        title: pathology.title,
        slug: pathology.slug,
        shortDescription: pathology.shortDescription,
        definition: pathology.definition,
        examinations: pathology.examinations,
        referentialDiagnosis: pathology.referentialDiagnosis,
        onSiteTreatment: pathology.onSiteTreatment,
        dischargeOrder: pathology.dischargeOrder,
        prevention: pathology.prevention,
        references: pathology.references || null,
        imageUrl: pathology.imageUrl || null,
        isFree: pathology.isFree,
        groupe: pathology.groupe,
        createdAt: pathology.createdAt,
        updatedAt: pathology.updatedAt,
      },
      create: {
        legacyMongoId,
        title: pathology.title,
        slug: pathology.slug,
        shortDescription: pathology.shortDescription,
        definition: pathology.definition,
        examinations: pathology.examinations,
        referentialDiagnosis: pathology.referentialDiagnosis,
        onSiteTreatment: pathology.onSiteTreatment,
        dischargeOrder: pathology.dischargeOrder,
        prevention: pathology.prevention,
        references: pathology.references || null,
        imageUrl: pathology.imageUrl || null,
        isFree: pathology.isFree,
        groupe: pathology.groupe,
        createdAt: pathology.createdAt,
        updatedAt: pathology.updatedAt,
      },
    });

    pathologyMap.set(legacyMongoId, upserted.id);
  }

  console.log('Migration settings...');
  const settings = await SiteSetting.find().lean();
  for (const setting of settings) {
    const legacyMongoId = String(setting._id);
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {
        legacyMongoId,
        siteName: setting.siteName,
        supportEmail: setting.supportEmail,
        maintenanceMode: setting.maintenanceMode,
        registrationsOpen: setting.registrationsOpen,
        messageMaintenance: setting.messageMaintenance,
        primaryColor: setting.primaryColor,
        secondaryColor: setting.secondaryColor,
        donationUrl: setting.donationUrl,
        donationPopupIntervalMinutes: setting.donationPopupIntervalMinutes,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      },
      create: {
        legacyMongoId,
        key: setting.key,
        siteName: setting.siteName,
        supportEmail: setting.supportEmail,
        maintenanceMode: setting.maintenanceMode,
        registrationsOpen: setting.registrationsOpen,
        messageMaintenance: setting.messageMaintenance,
        primaryColor: setting.primaryColor,
        secondaryColor: setting.secondaryColor,
        donationUrl: setting.donationUrl,
        donationPopupIntervalMinutes: setting.donationPopupIntervalMinutes,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      },
    });
  }

  console.log('Migration topics...');
  const topics = await Topic.find().lean();
  for (const topic of topics) {
    const legacyMongoId = String(topic._id);
    const authorId = userMap.get(String(topic.author));
    if (!authorId) continue;

    const pathologyId = topic.pathology ? pathologyMap.get(String(topic.pathology)) : null;

    const upserted = await prisma.topic.upsert({
      where: { legacyMongoId },
      update: {
        title: topic.title,
        content: topic.content,
        replyCount: topic.replyCount,
        isPinned: topic.isPinned,
        authorId,
        pathologyId: pathologyId || null,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      },
      create: {
        legacyMongoId,
        title: topic.title,
        content: topic.content,
        replyCount: topic.replyCount,
        isPinned: topic.isPinned,
        authorId,
        pathologyId: pathologyId || null,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      },
    });

    topicMap.set(legacyMongoId, upserted.id);
  }

  console.log('Migration messages...');
  const messages = await Message.find().lean();
  for (const message of messages) {
    const legacyMongoId = String(message._id);
    const topicId = topicMap.get(String(message.topic));
    const authorId = userMap.get(String(message.author));
    if (!topicId || !authorId) continue;

    await prisma.message.upsert({
      where: { legacyMongoId },
      update: {
        content: message.content,
        topicId,
        authorId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
      create: {
        legacyMongoId,
        content: message.content,
        topicId,
        authorId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    });
  }

  console.log('Migration questions...');
  const questions = await Question.find().lean();
  for (const question of questions) {
    const legacyMongoId = String(question._id);
    const pathologyId = pathologyMap.get(String(question.pathology));
    if (!pathologyId) continue;

    const upserted = await prisma.question.upsert({
      where: { legacyMongoId },
      update: {
        questionText: question.questionText,
        type: normalizeQuestionType(question.type),
        options: question.options as any,
        explanation: question.explanation || null,
        pathologyId,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
      create: {
        legacyMongoId,
        questionText: question.questionText,
        type: normalizeQuestionType(question.type),
        options: question.options as any,
        explanation: question.explanation || null,
        pathologyId,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
    });

    questionMap.set(legacyMongoId, upserted.id);
  }

  console.log('Migration user answers...');
  const answers = await UserAnswer.find().lean();
  for (const answer of answers) {
    const legacyMongoId = String(answer._id);
    const userId = userMap.get(String(answer.user));
    const questionId = questionMap.get(String(answer.question));
    if (!userId || !questionId) continue;

    await prisma.userAnswer.upsert({
      where: { legacyMongoId },
      update: {
        answer: answer.answer as any,
        isCorrect: answer.isCorrect,
        userId,
        questionId,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      },
      create: {
        legacyMongoId,
        answer: answer.answer as any,
        isCorrect: answer.isCorrect,
        userId,
        questionId,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt,
      },
    });
  }

  console.log('Migration training sessions...');
  const sessions = await TrainingSession.find().lean();
  for (const session of sessions) {
    const legacyMongoId = String(session._id);
    const userId = userMap.get(String(session.user));
    if (!userId) continue;

    const normalizedQuestions = Array.isArray(session.questions)
      ? session.questions.map((entry: any) => ({
          ...entry,
          legacyQuestionId: entry.question ? String(entry.question) : undefined,
          legacyPathologyId: entry.pathologyId ? String(entry.pathologyId) : undefined,
          questionId: entry.question ? questionMap.get(String(entry.question)) || null : null,
          pathologyId: entry.pathologyId ? pathologyMap.get(String(entry.pathologyId)) || null : null,
        }))
      : [];

    await prisma.trainingSession.upsert({
      where: { legacyMongoId },
      update: {
        mode: normalizeTrainingMode(session.mode),
        limit: session.limit,
        status: normalizeTrainingStatus(session.status),
        startedAt: session.startedAt,
        completedAt: session.completedAt || null,
        totalQuestions: session.totalQuestions,
        answeredCount: session.answeredCount,
        correctCount: session.correctCount,
        scorePercentage: session.scorePercentage,
        durationSeconds: session.durationSeconds || null,
        questions: normalizedQuestions as any,
        userId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      create: {
        legacyMongoId,
        mode: normalizeTrainingMode(session.mode),
        limit: session.limit,
        status: normalizeTrainingStatus(session.status),
        startedAt: session.startedAt,
        completedAt: session.completedAt || null,
        totalQuestions: session.totalQuestions,
        answeredCount: session.answeredCount,
        correctCount: session.correctCount,
        scorePercentage: session.scorePercentage,
        durationSeconds: session.durationSeconds || null,
        questions: normalizedQuestions as any,
        userId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  }

  console.log('Migration audit logs...');
  const logs = await AuditLog.find().lean();
  for (const log of logs) {
    const legacyMongoId = String(log._id);
    const actorId = log.actorId ? userMap.get(String(log.actorId)) || null : null;

    await prisma.auditLog.upsert({
      where: { legacyMongoId },
      update: {
        actorId,
        actorEmail: log.actorEmail || null,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || null,
        details: (log.details as any) || null,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      },
      create: {
        legacyMongoId,
        actorId,
        actorEmail: log.actorEmail || null,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || null,
        details: (log.details as any) || null,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      },
    });
  }

  console.log('Migration MongoDB -> PostgreSQL terminee avec succes.');
};

main()
  .catch((error) => {
    console.error('Migration echouee:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await disconnectMongo();
  });
