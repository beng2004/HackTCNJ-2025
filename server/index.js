const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
console.log("MONGO_URI:", process.env.MONGO_URI);
const Board = require('./models/Board');
const Post = require('./models/Post');
const Flyer = require('./models/Flyer');
const Note = require('./models/Note');
const Comment = require('./models/Comment');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Bulletin Board Backend');
});

/**
 * @route POST /boards
 * @desc Create a new board
 * @access Public
 */
app.post('/boards', async (req, res) => {
  try {
    const { boardType, boardName, boardId } = req.body;
    const board = new Board({
      boardType,
      boardName,
      boardId: Number(boardId)
    });
    const newBoard = await board.save();
    res.status(201).json(newBoard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/boards', async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /posts
 * @desc Create a new post
 * @access Public
 */
app.post('/posts', async (req, res) => {
  try {
    const { type, postId, ...postData } = req.body;
    let newPost;

    if (type === 'note') {
      newPost = new Note({ postId: Number(postId), ...postData });
    } else if (type === 'flyer') {
      newPost = new Flyer({ postId: Number(postId), ...postData });
    } else {
      return res.status(400).json({ message: 'Invalid post type' });
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /comments
 * @desc Create a new comment
 * @access Public
 */
app.post('/comments', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
