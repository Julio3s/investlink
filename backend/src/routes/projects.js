const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projectController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProjects_public);
router.get('/my', authenticate, ctrl.getMyProjects);
router.get('/:id', ctrl.getProject);
router.post('/', authenticate, requireRole('porteur'), upload.fields([
  { name: 'pitch_deck', maxCount: 1 },
  { name: 'project_image', maxCount: 1 },
]), ctrl.createProject);
router.put('/:id', authenticate, requireRole('porteur', 'admin'), upload.fields([
  { name: 'pitch_deck', maxCount: 1 },
  { name: 'project_image', maxCount: 1 },
]), ctrl.updateProject);
router.delete('/:id', authenticate, ctrl.deleteProject);
router.post('/:id/favorite', authenticate, requireRole('investisseur'), ctrl.toggleFavorite);
router.post('/:id/update', authenticate, requireRole('porteur'), ctrl.addProjectUpdate);

function getProjects_public(req, res, next) {
  ctrl.getProjects(req, res, next);
}

module.exports = router;
