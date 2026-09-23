const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Protect all instructor routes: must be logged in as instructor or admin
router.use(verifyToken, requireRole('instructor', 'admin'));

router.post('/programs', instructorController.createProgram);
router.put('/programs/:programId', instructorController.updateProgram);
router.delete('/programs/:programId', instructorController.deleteProgram);

router.post('/programs/:programId/modules', instructorController.addModule);
router.put('/modules/:moduleId', instructorController.updateModule);
router.delete('/modules/:moduleId', instructorController.deleteModule);

router.post('/modules/:moduleId/quiz', instructorController.createOrUpdateQuiz);

module.exports = router;
