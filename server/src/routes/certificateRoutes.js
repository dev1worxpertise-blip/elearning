const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, certificateController.getUserCertificates);
router.get('/verify/:credentialId', certificateController.verifyCertificate);

module.exports = router;
