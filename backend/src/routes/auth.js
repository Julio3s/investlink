const express = require('express');
const router = express.Router();
const { register, login, getMe, getMembers, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/members', authenticate, getMembers);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);

module.exports = router;
