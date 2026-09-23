const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { getReviews, addReview } = require('../controllers/reviewController');

const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Routes
router.get('/', getProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getReviews);
router.get('/:id', getProductById);

// Auth-protected review submission
router.post('/:id/reviews', protect, addReview);

// Admin Routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('mainImg'),
  createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.single('mainImg'),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteProduct
);

module.exports = router;