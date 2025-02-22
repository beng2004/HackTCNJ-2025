const mongoose = require('mongoose');
const Post = require('./Post');

const noteSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  }
});

module.exports = Post.discriminator('Note', noteSchema);
