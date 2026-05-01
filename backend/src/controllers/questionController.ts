import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { questionService } from '../services/questionService';
import { trainingService } from '../services/trainingService';
import mongoose from 'mongoose';

export const getQuestionsByPathology = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pathologyId } = req.params;
    const questions = await questionService.getQuestionsByPathology(pathologyId);

    res.status(200).json({ questions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { questionId, answer } = req.body;
    const userAnswer = await questionService.submitAnswer(req.userId, questionId, answer);

    res.status(201).json({ message: 'Reponse enregistree', data: userAnswer });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { pathologyId } = req.query;
    const answers = await questionService.getUserAnswers(
      req.userId,
      pathologyId as string | undefined
    );

    res.status(200).json({ answers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { pathologyId } = req.params;
    const score = await questionService.getScore(req.userId, pathologyId);

    res.status(200).json(score);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrainingQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawType = (req.query.type as string) || 'all';
    const type = ['QCM', 'QCD', 'all'].includes(rawType)
      ? (rawType as 'QCM' | 'QCD' | 'all')
      : 'all';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);

    const questions = await questionService.getTrainingQuestions(type, limit);
    res.status(200).json({ questions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestionById(id);

    if (!question) {
      res.status(404).json({ message: 'Question introuvable' });
      return;
    }

    res.status(200).json(question);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const startTrainingSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const rawMode = (req.body.mode as string) || 'all';
    const mode = ['QCM', 'QCD', 'all'].includes(rawMode)
      ? (rawMode as 'QCM' | 'QCD' | 'all')
      : 'all';
    const limit = Math.min(Math.max(parseInt(req.body.limit, 10) || 10, 1), 50);
    const pathologyId = typeof req.body.pathologyId === 'string' && req.body.pathologyId.trim().length > 0
      ? req.body.pathologyId
      : undefined;

    const { session, questions } = await trainingService.startSession(req.userId, mode, limit, pathologyId);

    if (!session || questions.length === 0) {
      res.status(200).json({
        message: 'Aucune question disponible pour cette configuration',
        session: null,
        questions: [],
      });
      return;
    }

    res.status(201).json({
      session: {
        id: String(session._id),
        mode: session.mode,
        limit: session.limit,
        status: session.status,
        startedAt: session.startedAt,
        totalQuestions: session.totalQuestions,
      },
      questions,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur au demarrage de la session' });
  }
};

export const submitTrainingAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { sessionId } = req.params;
    const { questionId, selectedOptionIndex } = req.body;

    if (!questionId || typeof selectedOptionIndex !== 'number') {
      res.status(400).json({ message: 'questionId et selectedOptionIndex sont requis' });
      return;
    }

    const result = await trainingService.submitAnswer(
      req.userId,
      sessionId,
      String(questionId),
      selectedOptionIndex,
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la soumission de la reponse' });
  }
};

export const completeTrainingSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { sessionId } = req.params;
    const session = await trainingService.completeSession(req.userId, sessionId);

    res.status(200).json({
      id: String(session._id),
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      totalQuestions: session.totalQuestions,
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      scorePercentage: session.scorePercentage,
      durationSeconds: session.durationSeconds,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la finalisation' });
  }
};

export const getTrainingDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const dashboard = await trainingService.getDashboard(req.userId);
    res.status(200).json(dashboard);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement du tableau de bord' });
  }
};

export const getTrainingHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 10, 1), 500);
    const mode = ['QCM', 'QCD', 'all'].includes(String(req.query.mode))
      ? (req.query.mode as 'QCM' | 'QCD' | 'all')
      : undefined;
    const status = ['in_progress', 'completed', 'abandoned'].includes(String(req.query.status))
      ? (req.query.status as 'in_progress' | 'completed' | 'abandoned')
      : undefined;
    const minScore = req.query.minScore !== undefined ? Number(req.query.minScore) : undefined;
    const maxScore = req.query.maxScore !== undefined ? Number(req.query.maxScore) : undefined;
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : undefined;

    const history = await trainingService.getHistory(req.userId, page, limit, {
      mode,
      status,
      minScore: Number.isFinite(minScore) ? minScore : undefined,
      maxScore: Number.isFinite(maxScore) ? maxScore : undefined,
      dateFrom: dateFrom && !Number.isNaN(dateFrom.getTime()) ? dateFrom : undefined,
      dateTo: dateTo && !Number.isNaN(dateTo.getTime()) ? dateTo : undefined,
    });
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement de l historique' });
  }
};

export const getActiveTrainingSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const session = await trainingService.getActiveSession(req.userId);
    res.status(200).json({ session });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement de la session active' });
  }
};

export const getTrainingSessionDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const { sessionId } = req.params;
    const session = await trainingService.getSessionDetail(req.userId, sessionId);
    res.status(200).json(session);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Session introuvable' });
  }
};

export const getTrainingCatalog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const catalog = await trainingService.getCatalog();
    res.status(200).json({ catalog });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement du catalogue' });
  }
};

export const getAdminQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 100);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const { questions, total } = await questionService.getAllQuestions(page, limit, search);
    res.status(200).json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors du chargement des questions admin' });
  }
};

export const createAdminQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json({ message: 'Question creee', question });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la creation de la question' });
  }
};

export const updateAdminQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await questionService.updateQuestion(id, req.body);

    if (!question) {
      res.status(404).json({ message: 'Question introuvable' });
      return;
    }

    res.status(200).json({ message: 'Question mise a jour', question });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur lors de la mise a jour de la question' });
  }
};

export const deleteAdminQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await questionService.deleteQuestion(id);
    res.status(200).json({ message: 'Question supprimee' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression de la question' });
  }
};
