const mongoose = require('mongoose');
const Post = require('./Post');

const flyerSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true
  },
  caption: {
    type: String
  },
  imageUrl: {
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

module.exports = Post.discriminator('flyer', flyerSchema);
