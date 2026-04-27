const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMyWallet } = require('../controllers/walletController');

router.get('/me', authenticate, getMyWallet);

module.exports = router;
