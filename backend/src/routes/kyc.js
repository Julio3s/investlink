const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/kycController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/submit', authenticate, upload.fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]), ctrl.submitKYC);
router.get('/status', authenticate, ctrl.getKYCStatus);
router.get('/pending', authenticate, requireRole('admin'), ctrl.getPendingKYC);
router.post('/:userId/validate', authenticate, requireRole('admin'), ctrl.validateKYC);

module.exports = router;
