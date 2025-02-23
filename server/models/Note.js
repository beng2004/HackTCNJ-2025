const mongoose = require('mongoose');
const Post = require('./Post');

const noteSchema = new mongoose.Schema({
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
