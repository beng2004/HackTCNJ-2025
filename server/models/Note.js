const mongoose = require('mongoose');
const Post = require('./Post');

const noteSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  rotation: {
    type: Number,
    required: true
  }
});

module.exports = Post.discriminator('note', noteSchema);
