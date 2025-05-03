const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const businessController = require('../controllers/business.controller');
const authMiddleware = require('../middleware/auth.middleware');
const businessMiddleware = require('../middleware/business.middleware');

// Get all businesses
router.get('/', businessController.getAllBusinesses);

// Get business by ID
router.get('/:id', businessController.getBusinessById);

// Create business profile (requires auth and business user type)
router.post(
  '/',
  authMiddleware,
  businessMiddleware,
  [
    body('name').notEmpty().withMessage('Business name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('location.coordinates').isArray().withMessage('Location coordinates are required'),
    body('businessType').isIn(['restaurant', 'supermarket', 'bakery', 'cafe', 'other']).withMessage('Invalid business type'),
    body('openingHours').isObject().withMessage('Opening hours are required')
  ],
  businessController.createBusiness
);

// Update business profile
router.put(
  '/:id',
  authMiddleware,
  businessMiddleware,
  businessController.updateBusiness
);

// Get business analytics
router.get(
  '/:id/analytics',
  authMiddleware,
  businessMiddleware,
  businessController.getBusinessAnalytics
);

// Get business reviews
router.get('/:id/reviews', businessController.getBusinessReviews);

// Add business review
router.post(
  '/:id/reviews',
  authMiddleware,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional()
  ],
  businessController.addBusinessReview
);

module.exports = router;
