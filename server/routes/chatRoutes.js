const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, sendMessage);
router.post('/message', optionalAuth, sendMessage);

module.exports = router;
