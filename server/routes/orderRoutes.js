const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, cancelOrder, getAllOrders,
  getOrdersByUser, updateOrderStatus, approveOrder, rejectOrder, getPendingCount,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/pending-count', protect, adminOnly, getPendingCount);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/user/:userId', protect, adminOnly, getOrdersByUser);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/approve', protect, adminOnly, approveOrder);
router.put('/:id/reject', protect, adminOnly, rejectOrder);

module.exports = router;
