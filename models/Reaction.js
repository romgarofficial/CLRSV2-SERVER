const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'sad', 'angry'],
    required: true,
  },
  reactedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one reaction per user per news item
ReactionSchema.index({ news: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', ReactionSchema);
