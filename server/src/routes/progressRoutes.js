const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.post('/video', verifyToken, progressController.updateVideoProgress);
router.post('/quiz', verifyToken, progressController.submitQuiz);

module.exports = router;
