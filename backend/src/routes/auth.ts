import { Router } from 'express';
import {
	register,
	login,
	logout,
	getCurrentUser,
	refreshSession,
	updateProfile,
	changePassword,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { getCsrfToken } from '../middleware/csrf';
import {
	validateRegister,
	validateLogin,
	validateChangePassword,
	validateProfileUpdate,
	validate,
} from '../middleware/validation';
import { authLimiter } from '../middleware/security';

const router = Router();

router.get('/csrf', getCsrfToken);
router.post('/register', authLimiter, validateRegister, validate, register);
router.post('/login', authLimiter, validateLogin, validate, login);
router.post('/refresh', refreshSession);
router.post('/logout', logout);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validateProfileUpdate, validate, updateProfile);
router.post('/change-password', authenticateToken, authLimiter, validateChangePassword, validate, changePassword);

export default router;
