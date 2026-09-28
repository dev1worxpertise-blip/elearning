/**
 * Enterprise Routes:
 * Audit Logs, Discussions, Notes, Bulk User Import, Gamification, and Email Dispatches
 */
const express = require('express');
const router = express.Router();
const enterpriseController = require('../controllers/enterpriseController');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');

// --- Audit Logs (Strict Admin only for viewing, authenticated for logging) ---
router.get('/audit-logs', verifyToken, requireRole('admin'), enterpriseController.getAuditLogs);
router.post('/audit-logs', verifyToken, enterpriseController.logAuditAction);

// --- Module Discussions & Q&A ---
router.get('/discussions-all', optionalAuth, enterpriseController.getAllDiscussions);
router.get('/discussions/:moduleId', optionalAuth, enterpriseController.getDiscussions);
router.post('/discussions/:moduleId', optionalAuth, enterpriseController.postDiscussion);
router.post('/discussions/:postId/replies', optionalAuth, enterpriseController.postDiscussionReply);
router.post('/discussions/like/:postId', optionalAuth, enterpriseController.likeDiscussion);

// --- Learner Timestamped Video Notes ---
router.get('/notes/:moduleId', optionalAuth, enterpriseController.getVideoNotes);
router.post('/notes/:moduleId', optionalAuth, enterpriseController.saveVideoNote);
router.delete('/notes/:noteId', optionalAuth, enterpriseController.deleteVideoNote);

// --- Bulk CSV User Import (Admin only) ---
router.post('/bulk-import', verifyToken, requireRole('admin'), enterpriseController.bulkImportUsers);

// --- Gamification & Leaderboard ---
router.get('/leaderboard', optionalAuth, enterpriseController.getLeaderboard);
router.post('/award-xp', verifyToken, enterpriseController.awardXP);

// --- Email & Notification Dispatches (Admin only) ---
router.get('/email-dispatches', verifyToken, requireRole('admin'), enterpriseController.getEmailDispatches);
router.post('/email-dispatches', verifyToken, enterpriseController.dispatchEmail);
router.get('/smtp-settings', verifyToken, requireRole('admin'), enterpriseController.getSmtpSettings);
router.post('/smtp-settings', verifyToken, requireRole('admin'), enterpriseController.saveSmtpSettings);
router.post('/test-email', verifyToken, requireRole('admin'), enterpriseController.testEmailConnection);

module.exports = router;
