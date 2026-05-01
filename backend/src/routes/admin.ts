import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import {
	getAdminDashboard,
	getAdminUsers,
	updateClientSubscription,
	getAdminForumMessages,
	deleteAdminForumMessage,
	getAdminBillingOverview,
	updatePaymentIntentStatus,
	getAdminSiteSettings,
	updateAdminSiteSettings,
	getAdminAdvancedAnalytics,
	deleteClientUser,
	setUserBanStatus,
	setUserMatriculeValidation,
	getAdminGroups,
	createAdminGroup,
	updateAdminGroup,
	deleteAdminGroup,
	setTopicPinned,
	getAdminAuditLogs,
} from '../controllers/adminController';

const router = Router();

router.get('/dashboard', authenticateToken, authorizeAdmin, getAdminDashboard);
router.get('/analytics/advanced', authenticateToken, authorizeAdmin, getAdminAdvancedAnalytics);
router.get('/users', authenticateToken, authorizeAdmin, getAdminUsers);
router.patch('/users/:id/subscription', authenticateToken, authorizeAdmin, updateClientSubscription);
router.patch('/users/:id/ban', authenticateToken, authorizeAdmin, setUserBanStatus);
router.patch('/users/:id/matricule-validation', authenticateToken, authorizeAdmin, setUserMatriculeValidation);
router.delete('/users/:id', authenticateToken, authorizeAdmin, deleteClientUser);
router.get('/forum/messages', authenticateToken, authorizeAdmin, getAdminForumMessages);
router.delete('/forum/messages/:id', authenticateToken, authorizeAdmin, deleteAdminForumMessage);
router.patch('/forum/topics/:id/pin', authenticateToken, authorizeAdmin, setTopicPinned);

router.get('/billing/overview', authenticateToken, authorizeAdmin, getAdminBillingOverview);
router.patch('/billing/payment-intents/:id/status', authenticateToken, authorizeAdmin, updatePaymentIntentStatus);

router.get('/settings/site', authenticateToken, authorizeAdmin, getAdminSiteSettings);
router.patch('/settings/site', authenticateToken, authorizeAdmin, updateAdminSiteSettings);

router.get('/groups', authenticateToken, authorizeAdmin, getAdminGroups);
router.post('/groups', authenticateToken, authorizeAdmin, createAdminGroup);
router.put('/groups/:id', authenticateToken, authorizeAdmin, updateAdminGroup);
router.delete('/groups/:id', authenticateToken, authorizeAdmin, deleteAdminGroup);

router.get('/audit/logs', authenticateToken, authorizeAdmin, getAdminAuditLogs);

export default router;
