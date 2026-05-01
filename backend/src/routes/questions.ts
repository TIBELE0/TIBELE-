import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import { exportLimiter } from '../middleware/security';
import {
  getQuestionsByPathology,
  submitAnswer,
  getUserAnswers,
  getScore,
  getTrainingQuestions,
  startTrainingSession,
  submitTrainingAnswer,
  completeTrainingSession,
  getTrainingDashboard,
  getTrainingHistory,
  getTrainingSessionDetail,
  getActiveTrainingSession,
  getTrainingCatalog,
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} from '../controllers/questionController';

const router = Router();

// Training route MUST be before /:pathologyId
router.get('/training', authenticateToken, getTrainingQuestions);
router.get('/training/catalog', authenticateToken, getTrainingCatalog);
router.post('/training/sessions', authenticateToken, startTrainingSession);
router.get('/training/sessions/active', authenticateToken, getActiveTrainingSession);
router.post('/training/sessions/:sessionId/answers', authenticateToken, submitTrainingAnswer);
router.post('/training/sessions/:sessionId/complete', authenticateToken, completeTrainingSession);
router.get('/training/dashboard', authenticateToken, getTrainingDashboard);
router.get('/training/history', authenticateToken, exportLimiter, getTrainingHistory);
router.get('/training/sessions/:sessionId', authenticateToken, getTrainingSessionDetail);

// Admin question management
router.get('/admin', authenticateToken, authorizeAdmin, getAdminQuestions);
router.post('/admin', authenticateToken, authorizeAdmin, createAdminQuestion);
router.put('/admin/:id', authenticateToken, authorizeAdmin, updateAdminQuestion);
router.delete('/admin/:id', authenticateToken, authorizeAdmin, deleteAdminQuestion);

router.get('/history/:userId', authenticateToken, getUserAnswers);
router.get('/score/:pathologyId', authenticateToken, getScore);
router.get('/:pathologyId', authenticateToken, getQuestionsByPathology);
router.post('/answer', authenticateToken, submitAnswer);

export default router;
