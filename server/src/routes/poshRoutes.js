/**
 * POSH Act Section 19: Internal Committee (IC) Grievance Redressal Routes
 */
const express = require('express');
const router = express.Router();
const poshHelpdeskController = require('../controllers/poshHelpdeskController');
const { optionalAuth, verifyToken, requireRole } = require('../middleware/auth');

// --- Learner / Complainant Endpoints ---
// File grievance (Confidential or Anonymous)
router.post('/file', optionalAuth, poshHelpdeskController.fileCase);

// Track grievance status using Case Number & secret PIN
router.post('/track', poshHelpdeskController.trackCase);

// Get my non-anonymous grievances
router.get('/my-cases', optionalAuth, poshHelpdeskController.getMyCases);

// --- Presiding Officer / Internal Committee Admin Endpoints ---
// List all grievances + stats
router.get('/admin/cases', optionalAuth, poshHelpdeskController.getAdminCases);

// Advance case status and record IC findings & actions
router.patch('/admin/cases/:id/status', optionalAuth, poshHelpdeskController.updateCaseStatus);

// Section 21 MWCD / District Officer Annual Compliance Report
router.get('/admin/annual-report', optionalAuth, poshHelpdeskController.getStatutoryAnnualReport);

module.exports = router;
