import express from 'express';
import * as menuController from '../controllers/menuController.js';
import authMiddleware from '../middleware/auth.js';
import requireRole from '../middleware/role.js';

const router = express.Router();

// Public routes
router.get('/', menuController.getMenuItems);
router.get('/:id', menuController.getMenuItemById);

// Admin-only routes
router.post('/', authMiddleware, requireRole('admin'), menuController.createMenuItem);
router.put('/:id', authMiddleware, requireRole('admin'), menuController.updateMenuItem);
router.delete('/:id', authMiddleware, requireRole('admin'), menuController.deleteMenuItem);

export default router;
