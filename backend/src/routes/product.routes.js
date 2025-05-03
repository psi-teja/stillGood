const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const businessMiddleware = require('../middleware/business.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Get all products (with filters)
router.get('/', productController.getAllProducts);

// Get products near user location
router.get('/nearby', productController.getNearbyProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create a new product (business only)
router.post(
  '/',
  authMiddleware,
  businessMiddleware,
  upload.array('images', 5),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('originalPrice').isNumeric().withMessage('Original price must be a number'),
    body('discountedPrice').isNumeric().withMessage('Discounted price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('pickupTimeStart').isISO8601().withMessage('Valid pickup start time is required'),
    body('pickupTimeEnd').isISO8601().withMessage('Valid pickup end time is required')
  ],
  productController.createProduct
);

// Update a product
router.put(
  '/:id',
  authMiddleware,
  businessMiddleware,
  upload.array('images', 5),
  productController.updateProduct
);

// Delete a product
router.delete(
  '/:id',
  authMiddleware,
  businessMiddleware,
  productController.deleteProduct
);

// Mark product as sold out
router.patch(
  '/:id/sold-out',
  authMiddleware,
  businessMiddleware,
  productController.markAsSoldOut
);

module.exports = router;
