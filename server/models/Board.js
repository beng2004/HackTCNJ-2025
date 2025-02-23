const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  boardType: {
    type: String,
    required: true
  },
  boardName: {
    type: String,
    required: true
  },
  boardId: {
    type: Number,
    required: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    field: '_id'
  }]
});

module.exports = mongoose.model('Board', boardSchema);
