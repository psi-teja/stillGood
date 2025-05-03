const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get all orders (for business)
router.get('/business', authMiddleware, orderController.getBusinessOrders);

// Get all orders (for consumer)
router.get('/consumer', authMiddleware, orderController.getConsumerOrders);

// Get order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// Create a new order
router.post(
  '/',
  authMiddleware,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('pickupTime').isISO8601().withMessage('Valid pickup time is required')
  ],
  orderController.createOrder
);

// Update order status (for business)
router.patch(
  '/:id/status',
  authMiddleware,
  [
    body('status').isIn(['pending', 'confirmed', 'ready', 'completed', 'cancelled']).withMessage('Invalid status')
  ],
  orderController.updateOrderStatus
);

// Cancel order (for consumer)
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);

// Confirm order pickup
router.patch('/:id/pickup', authMiddleware, orderController.confirmPickup);

// Add order review
router.post(
  '/:id/review',
  authMiddleware,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional()
  ],
  orderController.addOrderReview
);

module.exports = router;
