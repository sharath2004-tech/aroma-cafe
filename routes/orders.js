import express from 'express';
import * as orderController from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';
import requireRole from '../middleware/role.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

router.use(authMiddleware);

// Admin/Chef routes (registered before /:id so they aren't shadowed)
router.get('/admin/all-orders', requireRole('admin', 'chef'), orderController.getAllOrders);

// Customer routes
router.post('/', validateOrder, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin/Chef routes
router.put('/:id/status', requireRole('admin', 'chef'), orderController.updateOrderStatus);

export default router;
