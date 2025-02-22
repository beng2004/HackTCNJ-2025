const mongoose = require('mongoose');
const Post = require('./Post');

const flyerSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

module.exports = Post.discriminator('Flyer', flyerSchema);
