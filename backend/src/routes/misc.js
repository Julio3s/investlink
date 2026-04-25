const express = require('express');
const router = express.Router();
const aiCtrl = require('../controllers/aiController');
const notifCtrl = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.post('/ai/chat', authenticate, aiCtrl.chat);
router.get('/notifications', authenticate, notifCtrl.getNotifications);
router.put('/notifications/:id/read', authenticate, notifCtrl.markAsRead);

module.exports = router;
