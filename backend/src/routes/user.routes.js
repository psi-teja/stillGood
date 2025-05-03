const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Get current user profile
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile
router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('phone').optional(),
    body('address').optional(),
    body('preferences').optional()
  ],
  userController.updateProfile
);

// Get user's order history
router.get('/orders', authMiddleware, userController.getOrders);

// Get user's favorite businesses
router.get('/favorites', authMiddleware, userController.getFavorites);

// Add business to favorites
router.post('/favorites/:businessId', authMiddleware, userController.addFavorite);

// Remove business from favorites
router.delete('/favorites/:businessId', authMiddleware, userController.removeFavorite);

// Get user's impact metrics (food saved, CO2 reduced, etc.)
router.get('/impact', authMiddleware, userController.getImpactMetrics);

module.exports = router;
