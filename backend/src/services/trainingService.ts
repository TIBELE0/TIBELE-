import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

type TrainingMode = 'QCM' | 'QCD' | 'all';
type TrainingSessionStatus = 'in_progress' | 'completed' | 'abandoned';

interface TrainingQuestionSnapshot {
  question: string;
  pathologyId: string;
  pathologyTitle: string;
  pathologySlug: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: Array<{ text: string }>;
  correctOptionIndex: number;
  selectedOptionIndex?: number;
  isCorrect?: boolean;
  explanation?: string;
  answeredAt?: Date;
}

interface PublicTrainingQuestion {
  _id: string;
  questionText: string;
  type: 'QCM' | 'QCD';
  options: Array<{ text: string }>;
  explanation?: string;
  pathology: {
    _id: string;
    title: string;
    slug: string;
  };
}

interface DashboardStats {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    bestScore: number;
    totalAnswered: number;
    totalCorrect: number;
    accuracyRate: number;
    currentStreakDays: number;
    inProgressSessions: number;
  };
  trend7Days: Array<{ day: string; sessions: number; averageScore: number }>;
  byMode: Array<{ mode: TrainingMode; sessions: number; averageScore: number }>;
  weakPathologies: Array<{ pathologyId: string; pathologyTitle: string; accuracyRate: number; attempts: number }>;
  recentSessions: Array<{
    id: string;
    mode: TrainingMode;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    scorePercentage: number;
    answeredCount: number;
    totalQuestions: number;
  }>;
}

interface HistoryFilters {
  mode?: TrainingMode;
  status?: TrainingSessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
  minScore?: number;
  maxScore?: number;
}

const clampLimit = (limit: number): number => Math.min(Math.max(limit, 1), 50);

const getDurationSeconds = (startedAt: Date, completedAt: Date): number => {
  const deltaMs = completedAt.getTime() - startedAt.getTime();
  return Math.max(0, Math.round(deltaMs / 1000));
};

const parseSnapshots = (value: Prisma.JsonValue): TrainingQuestionSnapshot[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const item = entry as any;
      if (!item.question || !item.pathologyId || !item.questionText || !item.type) return null;

      const options = Array.isArray(item.options)
        ? item.options
          .map((opt: any) => ({ text: String(opt?.text ?? '') }))
          .filter((opt: { text: string }) => Boolean(opt.text))
        : [];

      if (!Array.isArray(options) || options.length === 0) return null;

      return {
        question: String(item.question),
        pathologyId: String(item.pathologyId),
        pathologyTitle: String(item.pathologyTitle ?? 'Pathologie inconnue'),
        pathologySlug: String(item.pathologySlug ?? ''),
        questionText: String(item.questionText),
        type: item.type === 'QCD' ? 'QCD' : 'QCM',
        options,
        correctOptionIndex: Number(item.correctOptionIndex ?? -1),
        selectedOptionIndex: item.selectedOptionIndex === undefined ? undefined : Number(item.selectedOptionIndex),
        isCorrect: item.isCorrect === undefined ? undefined : Boolean(item.isCorrect),
        explanation: item.explanation === undefined ? undefined : String(item.explanation),
        answeredAt: item.answeredAt ? new Date(item.answeredAt) : undefined,
      } as TrainingQuestionSnapshot;
    })
    .filter((item): item is TrainingQuestionSnapshot => item !== null && item.correctOptionIndex >= 0);
};

const toJsonSnapshots = (snapshots: TrainingQuestionSnapshot[]): Prisma.InputJsonValue => {
  return snapshots.map((item) => ({
    question: item.question,
    pathologyId: item.pathologyId,
    pathologyTitle: item.pathologyTitle,
    pathologySlug: item.pathologySlug,
    questionText: item.questionText,
    type: item.type,
    options: item.options,
    correctOptionIndex: item.correctOptionIndex,
    selectedOptionIndex: item.selectedOptionIndex,
    isCorrect: item.isCorrect,
    explanation: item.explanation,
    answeredAt: item.answeredAt ? item.answeredAt.toISOString() : undefined,
  }));
};

const toPublicQuestions = (snapshots: TrainingQuestionSnapshot[]): PublicTrainingQuestion[] => {
  return snapshots.map((item) => ({
    _id: String(item.question),
    questionText: item.questionText,
    type: item.type,
    options: item.options.map((opt) => ({ text: opt.text })),
    explanation: item.explanation,
    pathology: {
      _id: String(item.pathologyId),
      title: item.pathologyTitle,
      slug: item.pathologySlug,
    },
  }));
};

const withLegacyId = <T extends { id: string }>(row: T) => ({ ...row, _id: row.id });

const computeStreak = (completedDates: Date[]): number => {
  if (completedDates.length === 0) return 0;

  const uniqueDays = new Set(
    completedDates.map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()),
  );
  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const day of sortedDays) {
    const expected = cursor.getTime();
    if (day === expected) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    // Autoriser un decallage de 1 jour si aucune session aujourd hui.
    if (streak === 0 && day === expected - 86400000) {
      streak = 1;
      cursor.setDate(cursor.getDate() - 2);
      continue;
    }

    break;
  }

  return streak;
};

export const trainingService = {
  async getCatalog(): Promise<Array<{
    pathologyId: string;
    pathologyTitle: string;
    pathologySlug: string;
    groupe: string;
    qcmCount: number;
    qcdCount: number;
    totalCount: number;
  }>> {
    const questions = await prisma.question.findMany({
      where: { isHidden: false },
      select: {
        type: true,
        pathologyId: true,
        pathology: {
          select: {
            title: true,
            slug: true,
            groupe: true,
          },
        },
      },
    });

    const bucket = new Map<string, {
      pathologyId: string;
      pathologyTitle: string;
      pathologySlug: string;
      groupe: string;
      qcmCount: number;
      qcdCount: number;
      totalCount: number;
    }>();

    questions.forEach((q) => {
      const key = q.pathologyId;
      const existing = bucket.get(key);

      if (!existing) {
        bucket.set(key, {
          pathologyId: key,
          pathologyTitle: q.pathology.title,
          pathologySlug: q.pathology.slug,
          groupe: q.pathology.groupe,
          qcmCount: q.type === 'QCM' ? 1 : 0,
          qcdCount: q.type === 'QCD' ? 1 : 0,
          totalCount: 1,
        });
        return;
      }

      if (q.type === 'QCM') existing.qcmCount += 1;
      if (q.type === 'QCD') existing.qcdCount += 1;
      existing.totalCount += 1;
    });

    return Array.from(bucket.values()).sort((a, b) => {
      if (a.groupe !== b.groupe) return a.groupe.localeCompare(b.groupe);
      return a.pathologyTitle.localeCompare(b.pathologyTitle);
    });
  },

  async startSession(userId: string, mode: TrainingMode, rawLimit: number, pathologyId?: string) {
    const limit = clampLimit(rawLimit);
    const where: Prisma.QuestionWhereInput = {
      ...(mode === 'all' ? {} : { type: mode }),
      ...(pathologyId ? { pathologyId } : {}),
    };

    const pool = await prisma.question.findMany({
      where: { ...where, isHidden: false },
      include: {
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });

    if (pool.length === 0) {
      return { session: null, questions: [] as PublicTrainingQuestion[] };
    }

    const selected = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(limit, pool.length));

    const snapshots = selected
      .map((q) => {
        const options = Array.isArray(q.options) ? (q.options as any[]) : [];
        const normalizedOptions = options.map((opt) => ({
          text: String(opt?.text ?? ''),
          isCorrect: Boolean(opt?.isCorrect),
        }));

        const correctOptionIndex = normalizedOptions.findIndex((opt) => opt.isCorrect);
        if (correctOptionIndex < 0) return null;

        return {
          question: q.id,
          pathologyId: q.pathology.id,
          pathologyTitle: q.pathology.title ?? 'Pathologie inconnue',
          pathologySlug: q.pathology.slug ?? '',
          questionText: q.questionText,
          type: q.type,
          options: normalizedOptions.map((opt) => ({ text: opt.text })),
          correctOptionIndex,
          explanation: q.explanation ?? undefined,
        } as TrainingQuestionSnapshot;
      })
      .filter((item): item is TrainingQuestionSnapshot => item !== null);

    if (snapshots.length === 0) {
      return { session: null, questions: [] as PublicTrainingQuestion[] };
    }

    const session = await prisma.trainingSession.create({
      data: {
        userId,
        mode,
        limit,
        status: 'in_progress',
        startedAt: new Date(),
        totalQuestions: snapshots.length,
        answeredCount: 0,
        correctCount: 0,
        scorePercentage: 0,
        questions: toJsonSnapshots(snapshots),
      },
    });

    return {
      session: withLegacyId(session),
      questions: toPublicQuestions(snapshots),
    };
  },

  async submitAnswer(userId: string, sessionId: string, questionId: string, selectedOptionIndex: number) {
    const session = await prisma.trainingSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session introuvable');
    }

    if (session.status !== 'in_progress') {
      throw new Error('Cette session est deja terminee');
    }

    const snapshots = parseSnapshots(session.questions);
    const questionSnapshot = snapshots.find((item) => String(item.question) === questionId);

    if (!questionSnapshot) {
      throw new Error('Question absente de cette session');
    }

    if (questionSnapshot.selectedOptionIndex !== undefined) {
      return {
        alreadyAnswered: true,
        isCorrect: Boolean(questionSnapshot.isCorrect),
        correctOptionIndex: questionSnapshot.correctOptionIndex,
        explanation: questionSnapshot.explanation,
        selectedOptionIndex: questionSnapshot.selectedOptionIndex,
        answeredCount: session.answeredCount,
        totalQuestions: session.totalQuestions,
        scorePercentage: session.scorePercentage,
        sessionStatus: session.status,
      };
    }

    if (selectedOptionIndex < 0 || selectedOptionIndex >= questionSnapshot.options.length) {
      throw new Error('Reponse invalide');
    }

    const isCorrect = selectedOptionIndex === questionSnapshot.correctOptionIndex;
    questionSnapshot.selectedOptionIndex = selectedOptionIndex;
    questionSnapshot.isCorrect = isCorrect;
    questionSnapshot.answeredAt = new Date();

    await prisma.userAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId: questionSnapshot.question,
        },
      },
      create: {
        userId,
        questionId: questionSnapshot.question,
        pathologyId: questionSnapshot.pathologyId,
        answer: selectedOptionIndex,
        isCorrect,
      },
      update: {
        answer: selectedOptionIndex,
        isCorrect,
        pathologyId: questionSnapshot.pathologyId,
      },
    });

    const answered = snapshots.filter((item) => item.selectedOptionIndex !== undefined).length;
    const correct = snapshots.filter((item) => item.isCorrect === true).length;

    let nextStatus: TrainingSessionStatus = session.status;
    let completedAt: Date | null = session.completedAt;
    let durationSeconds = session.durationSeconds;
    let scorePercentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    if (answered >= session.totalQuestions) {
      completedAt = new Date();
      nextStatus = 'completed';
      durationSeconds = getDurationSeconds(session.startedAt, completedAt);
      scorePercentage = session.totalQuestions > 0
        ? Math.round((correct / session.totalQuestions) * 100)
        : 0;
    }

    const updated = await prisma.trainingSession.update({
      where: { id: session.id },
      data: {
        status: nextStatus,
        completedAt,
        durationSeconds,
        answeredCount: answered,
        correctCount: correct,
        scorePercentage,
        questions: toJsonSnapshots(snapshots),
      },
    });

    return {
      alreadyAnswered: false,
      isCorrect,
      correctOptionIndex: questionSnapshot.correctOptionIndex,
      explanation: questionSnapshot.explanation,
      selectedOptionIndex,
      answeredCount: updated.answeredCount,
      totalQuestions: updated.totalQuestions,
      scorePercentage: updated.scorePercentage,
      sessionStatus: updated.status,
    };
  },

  async completeSession(userId: string, sessionId: string) {
    const session = await prisma.trainingSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session introuvable');
    }

    if (session.status === 'completed') {
      return withLegacyId(session);
    }

    const snapshots = parseSnapshots(session.questions);
    const answered = snapshots.filter((item) => item.selectedOptionIndex !== undefined).length;
    const correct = snapshots.filter((item) => item.isCorrect === true).length;

    const completedAt = new Date();
    const scorePercentage = session.totalQuestions > 0
      ? Math.round((correct / session.totalQuestions) * 100)
      : 0;

    const updated = await prisma.trainingSession.update({
      where: { id: session.id },
      data: {
        answeredCount: answered,
        correctCount: correct,
        status: answered === 0 ? 'abandoned' : 'completed',
        completedAt,
        durationSeconds: getDurationSeconds(session.startedAt, completedAt),
        scorePercentage,
      },
    });

    return withLegacyId(updated);
  },

  async getSessionDetail(userId: string, sessionId: string) {
    const session = await prisma.trainingSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session introuvable');
    }

    const snapshots = parseSnapshots(session.questions);

    return {
      id: String(session.id),
      mode: session.mode,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      totalQuestions: session.totalQuestions,
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      scorePercentage: session.scorePercentage,
      durationSeconds: session.durationSeconds,
      questions: snapshots.map((q) => ({
        questionId: String(q.question),
        pathologyId: String(q.pathologyId),
        pathologyTitle: q.pathologyTitle,
        pathologySlug: q.pathologySlug,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        selectedOptionIndex: q.selectedOptionIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect: q.isCorrect,
        explanation: q.explanation,
        answeredAt: q.answeredAt,
      })),
    };
  },

  async getActiveSession(userId: string) {
    const session = await prisma.trainingSession.findFirst({
      where: { userId, status: 'in_progress' },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) {
      return null;
    }

    const snapshots = parseSnapshots(session.questions);
    const nextQuestionIndex = snapshots.findIndex((q) => q.selectedOptionIndex === undefined);

    return {
      id: String(session.id),
      mode: session.mode,
      status: session.status,
      startedAt: session.startedAt,
      totalQuestions: session.totalQuestions,
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      scorePercentage: session.scorePercentage,
      nextQuestionIndex: nextQuestionIndex >= 0 ? nextQuestionIndex : session.totalQuestions,
      questions: snapshots.map((q) => ({
        questionId: String(q.question),
        questionText: q.questionText,
        type: q.type,
        pathology: {
          _id: String(q.pathologyId),
          title: q.pathologyTitle,
          slug: q.pathologySlug,
        },
        options: q.options,
        selectedOptionIndex: q.selectedOptionIndex,
        correctOptionIndex: q.selectedOptionIndex !== undefined ? q.correctOptionIndex : undefined,
        isCorrect: q.selectedOptionIndex !== undefined ? q.isCorrect : undefined,
        explanation: q.selectedOptionIndex !== undefined ? q.explanation : undefined,
      })),
    };
  },

  async getHistory(userId: string, page: number, limit: number, filters: HistoryFilters = {}) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.TrainingSessionWhereInput = {
      userId,
      ...(filters.mode ? { mode: filters.mode } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...((filters.minScore !== undefined || filters.maxScore !== undefined)
        ? {
          scorePercentage: {
            ...(filters.minScore !== undefined ? { gte: filters.minScore } : {}),
            ...(filters.maxScore !== undefined ? { lte: filters.maxScore } : {}),
          },
        }
        : {}),
      ...((filters.dateFrom || filters.dateTo)
        ? {
          startedAt: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
        : {}),
    };

    const [total, sessions] = await Promise.all([
      prisma.trainingSession.count({ where }),
      prisma.trainingSession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: safeLimit,
      }),
    ]);

    return {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
      filters: {
        mode: filters.mode || null,
        status: filters.status || null,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        minScore: filters.minScore ?? null,
        maxScore: filters.maxScore ?? null,
      },
      sessions: sessions.map((session) => ({
        id: String(session.id),
        mode: session.mode,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalQuestions: session.totalQuestions,
        answeredCount: session.answeredCount,
        correctCount: session.correctCount,
        scorePercentage: session.scorePercentage,
        durationSeconds: session.durationSeconds,
      })),
    };
  },

  async getDashboard(userId: string): Promise<DashboardStats> {
    const sessions = await prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    const completed = sessions.filter((s) => s.status === 'completed');
    const inProgress = sessions.filter((s) => s.status === 'in_progress');

    const totalAnswered = completed.reduce((sum, s) => sum + s.answeredCount, 0);
    const totalCorrect = completed.reduce((sum, s) => sum + s.correctCount, 0);
    const averageScore = completed.length > 0
      ? Math.round(completed.reduce((sum, s) => sum + s.scorePercentage, 0) / completed.length)
      : 0;
    const bestScore = completed.length > 0
      ? Math.max(...completed.map((s) => s.scorePercentage))
      : 0;
    const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const completedDates = completed
      .map((s) => s.completedAt)
      .filter((d): d is Date => Boolean(d));

    const currentStreakDays = computeStreak(completedDates);

    const modeBuckets: TrainingMode[] = ['QCM', 'QCD', 'all'];
    const byMode: Array<{ mode: TrainingMode; sessions: number; averageScore: number }> = modeBuckets.map(
      (mode) => {
        const modeSessions = completed.filter((s) => s.mode === mode);
        const modeAvg = modeSessions.length > 0
          ? Math.round(modeSessions.reduce((sum, s) => sum + s.scorePercentage, 0) / modeSessions.length)
          : 0;
        return {
          mode,
          sessions: modeSessions.length,
          averageScore: modeAvg,
        };
      },
    );

    const now = new Date();
    const dayKeys: string[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }

    const trendMap = new Map<string, { sessions: number; scoreTotal: number }>();
    dayKeys.forEach((day) => trendMap.set(day, { sessions: 0, scoreTotal: 0 }));

    completed.forEach((s) => {
      if (!s.completedAt) return;
      const day = `${s.completedAt.getFullYear()}-${String(s.completedAt.getMonth() + 1).padStart(2, '0')}-${String(s.completedAt.getDate()).padStart(2, '0')}`;
      const entry = trendMap.get(day);
      if (!entry) return;
      entry.sessions += 1;
      entry.scoreTotal += s.scorePercentage;
    });

    const trend7Days = dayKeys.map((day) => {
      const entry = trendMap.get(day)!;
      return {
        day,
        sessions: entry.sessions,
        averageScore: entry.sessions > 0 ? Math.round(entry.scoreTotal / entry.sessions) : 0,
      };
    });

    const pathologyBucket = new Map<string, { pathologyTitle: string; attempts: number; correct: number }>();

    completed.forEach((session) => {
      const snapshots = parseSnapshots(session.questions);
      snapshots.forEach((question) => {
        if (question.selectedOptionIndex === undefined) return;

        const key = String(question.pathologyId);
        const existing = pathologyBucket.get(key);
        if (!existing) {
          pathologyBucket.set(key, {
            pathologyTitle: question.pathologyTitle,
            attempts: 1,
            correct: question.isCorrect ? 1 : 0,
          });
          return;
        }

        existing.attempts += 1;
        if (question.isCorrect) existing.correct += 1;
      });
    });

    const weakPathologies = Array.from(pathologyBucket.entries())
      .map(([pathologyId, value]) => ({
        pathologyId,
        pathologyTitle: value.pathologyTitle,
        attempts: value.attempts,
        accuracyRate: value.attempts > 0 ? Math.round((value.correct / value.attempts) * 100) : 0,
      }))
      .filter((item) => item.attempts >= 3)
      .sort((a, b) => a.accuracyRate - b.accuracyRate)
      .slice(0, 5);

    const recentSessions = sessions.slice(0, 10).map((session) => ({
      id: String(session.id),
      mode: session.mode,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt || undefined,
      scorePercentage: session.scorePercentage,
      answeredCount: session.answeredCount,
      totalQuestions: session.totalQuestions,
    }));

    return {
      overview: {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        averageScore,
        bestScore,
        totalAnswered,
        totalCorrect,
        accuracyRate,
        currentStreakDays,
        inProgressSessions: inProgress.length,
      },
      trend7Days,
      byMode,
      weakPathologies,
      recentSessions,
    };
  },
};
