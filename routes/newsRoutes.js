const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authMiddleware, requireRole } = require('../middleware');

// Create news
router.post('/', authMiddleware, newsController.createNews);
// Get all news
router.get('/', newsController.getAllNews);
// Get pinned news
router.get('/pinned', newsController.getPinnedNews);
// Get current user's news
router.get('/mine', authMiddleware, newsController.getMyNews);
// Get news by ID
router.get('/:id', newsController.getNewsById);
// Get reactions for a news item
router.get('/:id/reactions', newsController.getReactions);
// Update news
router.put('/:id', authMiddleware, newsController.updateNews);
// Delete news
router.delete('/:id', authMiddleware, newsController.deleteNews);
// Publish news
router.patch('/:id/publish', authMiddleware, newsController.publishNews);
// Pin/unpin news (admin and lab custodians only)
router.patch('/:id/pin', authMiddleware, requireRole('lab_custodian', 'admin'), newsController.pinNews);

// Add reaction to news
router.post('/:id/reactions', authMiddleware, newsController.addReaction);

// Remove reaction from news
router.delete('/:id/reactions', authMiddleware, newsController.removeReaction);

module.exports = router;
