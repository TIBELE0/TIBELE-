import { Prisma, QuestionType } from '@prisma/client';
import prisma from '../config/prisma';

type QuestionOption = { text: string; isCorrect: boolean };

const parseOptions = (value: Prisma.JsonValue): QuestionOption[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const text = typeof (entry as any).text === 'string' ? (entry as any).text : '';
      const isCorrect = Boolean((entry as any).isCorrect);
      return { text, isCorrect };
    })
    .filter((opt): opt is QuestionOption => opt !== null);
};

const mapQuestion = (question: any) => ({
  ...question,
  _id: question.id,
  pathology: question.pathology
    ? {
      _id: question.pathology.id,
      id: question.pathology.id,
      title: question.pathology.title,
      slug: question.pathology.slug,
    }
    : undefined,
  isHidden: Boolean(question.isHidden),
});

const mapUserAnswer = (row: any) => ({
  ...row,
  _id: row.id,
  user: row.user
    ? {
      _id: row.user.id,
      id: row.user.id,
      fullName: row.user.fullName,
      email: row.user.email,
    }
    : undefined,
  question: row.question ? mapQuestion(row.question) : undefined,
});

export const questionService = {
  async getAllQuestions(page: number = 1, limit: number = 20, search?: string): Promise<{ questions: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = search
      ? ({
          OR: [
            { questionText: { contains: search, mode: 'insensitive' as const } },
            { type: { equals: search.toUpperCase() as QuestionType } },
          ],
        } as Prisma.QuestionWhereInput)
      : {};

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: filter,
        include: {
          pathology: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where: filter }),
    ]);

    return { questions: questions.map(mapQuestion), total };
  },

  async getQuestionsByPathology(pathologyId: string): Promise<any[]> {
    const questions = await prisma.question.findMany({ where: { pathologyId, isHidden: false } });
    return questions.map((q) => ({ ...q, _id: q.id }));
  },

  async getQuestionById(questionId: string): Promise<any | null> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });
    return question ? mapQuestion(question) : null;
  },

  async createQuestion(data: {
    pathology: string;
    questionText: string;
    type: 'QCM' | 'QCD';
    options: Array<{ text: string; isCorrect: boolean }>;
    explanation?: string;
    isHidden?: boolean;
  }): Promise<any> {
    if (!data.questionText || !data.options || data.options.length === 0) {
      throw new Error('Question text and options are required');
    }

    // Validate that at least one option is correct
    const hasCorrectOption = data.options.some((opt) => opt.isCorrect);
    if (!hasCorrectOption) {
      throw new Error('Question must have at least one correct option');
    }

    const created = await prisma.question.create({
      data: {
        pathologyId: data.pathology,
        questionText: data.questionText,
        type: data.type,
        options: data.options as unknown as Prisma.JsonArray,
        explanation: data.explanation,
        isHidden: Boolean(data.isHidden),
      },
      include: {
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });

    return mapQuestion(created);
  },

  async updateQuestion(
    questionId: string,
    data: Partial<{
      pathology: string;
      questionText: string;
      type: 'QCM' | 'QCD';
      options: Array<{ text: string; isCorrect: boolean }>;
      explanation?: string;
      isHidden?: boolean;
    }>
  ): Promise<any | null> {
    if (data.options && data.options.length > 0) {
      const hasCorrectOption = data.options.some((opt) => opt.isCorrect);
      if (!hasCorrectOption) {
        throw new Error('Question must have at least one correct option');
      }
    }

    try {
      const updated = await prisma.question.update({
        where: { id: questionId },
        data: {
          ...(data.pathology ? { pathologyId: data.pathology } : {}),
          ...(data.questionText !== undefined ? { questionText: data.questionText } : {}),
          ...(data.type !== undefined ? { type: data.type } : {}),
          ...(data.options !== undefined ? { options: data.options as unknown as Prisma.JsonArray } : {}),
          ...(data.explanation !== undefined ? { explanation: data.explanation } : {}),
          ...(data.isHidden !== undefined ? { isHidden: Boolean(data.isHidden) } : {}),
        },
        include: {
          pathology: { select: { id: true, title: true, slug: true } },
        },
      });
      return mapQuestion(updated);
    } catch {
      return null;
    }
  },

  async submitAnswer(userId: string, questionId: string, answer: string | number | boolean): Promise<any> {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new Error('Question not found');
    }

    const options = parseOptions(question.options);

    // Determine if answer is correct
    let isCorrect = false;
    if (question.type === 'QCM') {
      const answerIndex = parseInt(answer as any, 10);
      if (answerIndex >= 0 && answerIndex < options.length) {
        isCorrect = options[answerIndex].isCorrect;
      }
    } else if (question.type === 'QCD') {
      const normalized = String(answer).trim().toLowerCase();
      const correctIndex = options.findIndex((opt) => opt.isCorrect);

      // Accept index-style answers for compatibility (0/1).
      const numericAnswer = Number(normalized);
      if (Number.isInteger(numericAnswer) && numericAnswer >= 0 && numericAnswer < options.length) {
        isCorrect = numericAnswer === correctIndex;
      } else {
        // Accept boolean-like answers: true/false, vrai/faux, 1/0.
        const answerAsBool = ['true', 'vrai', '1', 'yes', 'oui'].includes(normalized)
          ? true
          : ['false', 'faux', '0', 'no', 'non'].includes(normalized)
            ? false
            : null;

        if (answerAsBool !== null) {
          const trueIndex = options.findIndex((opt) => /^(true|vrai)$/i.test(opt.text.trim()));
          const falseIndex = options.findIndex((opt) => /^(false|faux)$/i.test(opt.text.trim()));

          if (answerAsBool && trueIndex !== -1) {
            isCorrect = trueIndex === correctIndex;
          } else if (!answerAsBool && falseIndex !== -1) {
            isCorrect = falseIndex === correctIndex;
          } else {
            // Fallback when option labels are non-standard.
            isCorrect = false;
          }
        }
      }
    }

    const saved = await prisma.userAnswer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      create: {
        userId,
        questionId,
        pathologyId: question.pathologyId,
        answer: answer as Prisma.InputJsonValue,
        isCorrect,
      },
      update: {
        answer: answer as Prisma.InputJsonValue,
        isCorrect,
        pathologyId: question.pathologyId,
      },
      include: {
        question: {
          include: {
            pathology: { select: { id: true, title: true, slug: true } },
          },
        },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return mapUserAnswer(saved);
  },

  async getUserAnswers(userId: string, pathologyId?: string): Promise<any[]> {
    const answers = await prisma.userAnswer.findMany({
      where: {
        userId,
        ...(pathologyId ? { question: { pathologyId } } : {}),
      },
      include: {
        question: {
          include: {
            pathology: { select: { id: true, title: true, slug: true } },
          },
        },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return answers.map(mapUserAnswer);
  },

  async getScore(userId: string, pathologyId: string): Promise<{ correct: number; total: number; percentage: number }> {
    const answers = await prisma.userAnswer.findMany({
      where: {
        userId,
        question: { pathologyId },
      },
      select: { isCorrect: true },
    });

    const correct = answers.filter((a) => a.isCorrect).length;
    const total = answers.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { correct, total, percentage };
  },

  async deleteQuestion(questionId: string): Promise<void> {
    // Delete all user answers for this question
    await prisma.userAnswer.deleteMany({ where: { questionId } });
    // Delete question
    await prisma.question.delete({ where: { id: questionId } });
  },

  async getTrainingQuestions(
    type: 'QCM' | 'QCD' | 'all',
    limit: number
  ): Promise<any[]> {
    const where = type === 'all'
      ? { isHidden: false }
      : ({ type, isHidden: false } as Prisma.QuestionWhereInput);
    const candidates = await prisma.question.findMany({
      where,
      select: { id: true },
    });

    if (candidates.length === 0) {
      return [];
    }

    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, Math.min(limit, candidates.length)).map((q) => q.id);

    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        pathology: { select: { id: true, title: true, slug: true } },
      },
    });

    return questions.map(mapQuestion);
  },
};
