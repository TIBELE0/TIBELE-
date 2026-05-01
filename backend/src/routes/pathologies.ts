import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import {
  getAllPathologies,
  getPathologyBySlug,
  searchPathologies,
  createPathology,
  updatePathology,
  deletePathology,
  getGroupes,
  getPathologiesByGroupe,
} from '../controllers/pathologyController';

const router = Router();

router.get('/', authenticateToken, getAllPathologies);
router.get('/search', authenticateToken, searchPathologies);
router.get('/groupes', authenticateToken, getGroupes);
router.get('/groupe/:nom', authenticateToken, getPathologiesByGroupe);
router.get('/:slug', authenticateToken, getPathologyBySlug);
router.post('/', authenticateToken, authorizeAdmin, createPathology);
router.put('/:id', authenticateToken, authorizeAdmin, updatePathology);
router.delete('/:id', authenticateToken, authorizeAdmin, deletePathology);

export default router;
