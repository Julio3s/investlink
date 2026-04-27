const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messagingController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/conversations', authenticate, ctrl.createConversation);
router.get('/conversations', authenticate, ctrl.getUserConversations);
router.get('/conversations/:id/messages', authenticate, ctrl.getMessages);
router.delete('/conversations/:id', authenticate, ctrl.deleteConversation);
router.post('/messages', authenticate, upload.single('file'), ctrl.sendMessage);
router.post('/conversations/:id/report', authenticate, ctrl.reportConversation);

module.exports = router;
