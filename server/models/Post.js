const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  postId: {
    type: Number,
    required: true,
    unique: false
  },
  type: {
    type: String,
    enum: ['note', 'flyer'],
    required: true
  },
  parentBoardId: {
    type: Number,
    required: true
  }
}, {
  discriminatorKey: 'type',
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
