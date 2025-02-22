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
    unique: true
  },
  type: {
    type: String,
    enum: ['note', 'flyer'],
    required: true
  }
}, {
  discriminatorKey: 'type',
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
