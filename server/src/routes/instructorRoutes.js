const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Protect all instructor routes: must be logged in as instructor or admin
router.use(verifyToken, requireRole('instructor', 'admin'));

router.post('/programs', instructorController.createProgram);
router.post('/programs/:programId/modules', instructorController.addModule);
router.post('/modules/:moduleId/quiz', instructorController.createOrUpdateQuiz);

module.exports = router;
