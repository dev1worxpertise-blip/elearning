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

// --- Module Discussions ---
router.get('/discussions/:moduleId', optionalAuth, enterpriseController.getDiscussions);
router.post('/discussions/:moduleId', verifyToken, enterpriseController.postDiscussion);
router.post('/discussions/like/:postId', verifyToken, enterpriseController.likeDiscussion);

// --- Learner Timestamped Video Notes ---
router.get('/notes/:moduleId', verifyToken, enterpriseController.getVideoNotes);
router.post('/notes/:moduleId', verifyToken, enterpriseController.saveVideoNote);
router.delete('/notes/:noteId', verifyToken, enterpriseController.deleteVideoNote);

// --- Bulk CSV User Import (Admin only) ---
router.post('/bulk-import', verifyToken, requireRole('admin'), enterpriseController.bulkImportUsers);

// --- Gamification & Leaderboard ---
router.get('/leaderboard', optionalAuth, enterpriseController.getLeaderboard);
router.post('/award-xp', verifyToken, enterpriseController.awardXP);

// --- Email & Notification Dispatches (Admin only) ---
router.get('/email-dispatches', verifyToken, requireRole('admin'), enterpriseController.getEmailDispatches);
router.post('/email-dispatches', verifyToken, enterpriseController.dispatchEmail);

module.exports = router;
