const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, getSettings, updateSettings,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/settings', getSettings);
router.put('/settings', protect, adminOnly, updateSettings);

module.exports = router;
