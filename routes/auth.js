import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware, { requireRole } from '../middleware/auth.js';
import verifyFirebaseToken from '../middleware/firebaseToken.js';

const router = express.Router();

router.post('/sync', verifyFirebaseToken, authController.sync);
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateMe);

// Admin user management
router.get('/users', authMiddleware, requireRole('admin'), authController.listUsers);
router.put('/users/:id/role', authMiddleware, requireRole('admin'), authController.updateUserRole);

export default router;
