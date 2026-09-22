const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, programController.getAllPrograms);
router.get('/enrolled', verifyToken, programController.getUserEnrolledPrograms);
router.get('/:id', optionalAuth, programController.getProgramById);
router.post('/enroll', verifyToken, programController.enrollProgram);

module.exports = router;
