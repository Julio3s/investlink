const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireRole('admin'), ctrl.getDashboard);
router.get('/users', authenticate, requireRole('admin'), ctrl.getUsers);
router.post('/users/:userId/suspend', authenticate, requireRole('admin'), ctrl.suspendUser);
router.get('/reports', authenticate, requireRole('admin'), ctrl.getReports);
router.put('/reports/:id', authenticate, requireRole('admin'), ctrl.resolveReport);
router.post('/projects/:id/moderate', authenticate, requireRole('admin'), ctrl.moderateProject);

module.exports = router;
