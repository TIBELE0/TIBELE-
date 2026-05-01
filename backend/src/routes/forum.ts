import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import {
  getTopics,
  createTopic,
  getTopic,
  createMessage,
  deleteMessage,
  deleteTopic,
} from '../controllers/forumController';

const router = Router();

router.get('/topics', authenticateToken, getTopics);
router.post('/topics', authenticateToken, createTopic);
router.get('/topics/:id', authenticateToken, getTopic);
router.post('/messages', authenticateToken, createMessage);
router.delete('/messages/:id', authenticateToken, deleteMessage);
router.delete('/topics/:id', authenticateToken, authorizeAdmin, deleteTopic);

export default router;
