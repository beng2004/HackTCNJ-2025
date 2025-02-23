/**
 * @file index.js
 * @description Main server file for the application. Sets up the Express server, connects to MongoDB, and defines API routes for boards, posts, comments, and file uploads.
 * @author Christopher Lam & Benjamin Guerrieri
 */

// import modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();


let uploadCounter = 0;

// Initialize uploadCounter with the highest number found in the uploads folder (this is kind of redundant with since we also rename the files to postId but w/e)
fs.readdir('server/uploads', (err, files) => {
  if (!err) {
    const numbers = files.map(file => parseInt(file, 10)).filter(num => !isNaN(num));
    if (numbers.length > 0) {
      uploadCounter = Math.max(...numbers) + 1;
    }
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('server/uploads'));

// database models
const Board = require('./models/Board');
const Post = require('./models/Post');
const Flyer = require('./models/Flyer');
const Note = require('./models/Note');
const Comment = require('./models/Comment');
const { OpenAI } = require('openai');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const port = process.env.PORT || 3001;

// Multer configuration (for file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const boardId = req.headers.boardid;
    const postId = req.headers.postid;
    const ext = path.extname(file.originalname);
    cb(null, boardId + '_' + postId + ext);
  }
});

const upload = multer({ storage: storage });

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// root route 
app.get('/', (req, res) => {
  res.send('You arent supposed to be here :o');
});

/**
 * @route POST /boards
 * @desc Create a new board (should have a boardType, boardName, and boardId)
 * @access Public
 */
app.post('/boards', async (req, res) => {
  try {
    const { boardType, boardName, boardId } = req.body;

    if (!boardType) {
      return res.status(400).json({ message: 'Missing boardType in the request body' });
    }

    const board = new Board({
      boardType,
      boardName,
      boardId: Number(boardId)
    });
    console.log('Creating board:', board);
    const newBoard = await board.save();
    console.log('Board created:', newBoard);
    res.status(201).json(newBoard);
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route GET /boards
 * @desc Get all boards
 * @access Public
 */
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
 * @desc Create a new post (requires type, postId, author, parentBoardId, and other data depending on the type)
 * @access Public
 */
app.post('/posts', async (req, res) => {
  const { type, postId, ...postData } = req.body;
  let newPost;

  if (type === 'note') {
    newPost = new Note({
      postId: Number(postId),
      author: postData.author,
      parentBoardId: postData.parentBoardId,
      ...postData
    });
  } else if (type === 'flyer') {
    newPost = new Flyer({
      postId: Number(postId),
      author: postData.author,
      parentBoardId: postData.parentBoardId,
      ...postData
    });
  } else {
    return res.status(400).json({ message: 'Unknown type created' });
  }
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route GET /posts
 * @desc Get all posts
 * @access Public
 */
app.get('/posts', async (req, res) => {
  try {
    const boardId = req.headers.boardid;
    const posts = await Post.find({ parentBoardId: boardId });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /comments
 * @desc Create a new comment (TODO: INDEVELOPMENT, does nothing atm)
 * @access Public
 */
app.post('/comments', async (req, res) => {
  try {
    // const comment = new Comment(req.body);
    // const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route GET /comments
 * @desc Get all comments (TODO: INDEVELOPMENT, does nothing atm)
 * @access Public
 */
app.get('/comments', async (req, res) => {
  try {
    // const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/update-position
 * @desc Update the position (x, y, rotation) of a note or flyer
 * @access Public
 */
app.post('/update-position', async (req, res) => {
  try {
    const {postId, type, x, y, rotation, parentBoardId } = req.body;

    let model;
    if (type === 'note') {
      model = Note;
    } else if (type === 'flyer') {
      model = Flyer;
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const item = await model.findOne({postId: postId, parentBoardId: parentBoardId });

    item.x = x;
    item.y = y;
    item.rotation = rotation;

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.save();

    res.json({ message: 'Position updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /upload
 * @desc Upload a file to the server
 * @access Public 
 */
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const boardId = req.headers.boardid;
    const postId = req.headers.postid;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!boardId) {
      return res.status(400).json({ message: 'No board ID provided' });
    }

    // Figure out which post to associate the image with
    const ext = path.extname(req.file.originalname);
    const newFilename = boardId + '_' + postId + ext;
    const oldPath = path.join(__dirname, 'uploads', req.file.filename);
    const newPath = path.join(__dirname, 'uploads', newFilename);

    // Rename the file to the postId and then search the database for the post and update the imageUrl field
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('Error renaming file:', err);
        return res.status(500).json({ message: 'Error renaming file' });
      }

      res.status(200).json({ message: 'File uploaded successfully', filename: newFilename, postId: postId });

      Flyer.findOneAndUpdate({ postId: Number(postId) }, { $set: {imageUrl: newFilename} }, { new: true })
        .then(updatedFlyer => {
          console.log("newFilename:", newFilename);
          console.log("Updated Flyer:", updatedFlyer);
          if (!updatedFlyer) {
            console.log("Flyer not found");
          } else {
            console.log("Flyer updated successfully");
          }
        })
        .catch(err => {
          console.error("Error updating flyer:", err);
          console.error("Error details:", err.message, err.stack);
        });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route DELETE /delete-post
 * @desc Delete a post (requires boardId, postId, and type)
 * @access Public
 */
app.delete('/delete-post', async (req, res) => {
  try {
    const boardId = req.headers.boardid;
    const postId = req.headers.postid;
    const type = req.headers.type; // this is required because of the way we define our model

    if (!boardId || !postId || !type) {
      return res.status(400).json({ message: 'Missing boardId, postId, or type' });
    }

    let model;
    if (type === 'note') {
      model = Note;
    } else if (type === 'flyer') {
      model = Flyer;
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const deletedPost = await model.findOneAndDelete({ postId: postId, parentBoardId: boardId });

    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete image in the local uploads folder (will need to be updated when switching images to a DB)
    if (deletedPost.imageUrl) {
      const imagePath = path.join(__dirname, 'uploads', deletedPost.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image:', err);
        } else {
          console.log('Image deleted successfully:', imagePath);
        }
      });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /summarize-ai
 * @desc Summarize all posts (notes and flyers) for a given board using GenAI
 */
app.post('/summarize-ai', async (req, res) => {
  console.log('Received summarize-ai request');
  try {
    const boardId = req.headers.boardid;
    console.log('boardId:', boardId);

    if (!boardId) {
      console.log('Missing boardId in the request headers');
      return res.status(400).json({ message: 'Missing boardId in the request headers' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('apiKey:', apiKey);
    if (!apiKey) {
      console.log('OPENAI_API_KEY environment variable not set');
      return res.status(500).json({ message: 'OPENAI_API_KEY environment variable not set' });
    }

    // Fetch all notes and flyers associated with the given boardId
    const notes = await Note.find({ parentBoardId: boardId });
    const flyers = await Flyer.find({ parentBoardId: boardId });

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    let summaries = [];
    let numNotes = 0;
    let numFlyers = 0;

    for (const note of notes) {
      if (note.text) {
        numNotes++;
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Summarize the following content: ${note.text}` }],
          });
          summaries.push(completion.choices[0].message.content);
        } catch (error) {
          console.error('Error summarizing note:', error);
          summaries.push(`Error summarizing note: ${error}`);
        }
      }
    }

    for (const flyer of flyers) {
      if (flyer.caption) {
        numFlyers++;
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Summarize the following content: ${flyer.caption}` }],
          });
          summaries.push(completion.choices[0].message.content);
        } catch (error) {
          console.error('Error summarizing flyer:', error);
          summaries.push(`Error summarizing flyer: ${error}`);
        }
      }
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Summarize the following content, making sure to be concise and accurate. 
          If there is not that much information the the prompt, make sure to make a small mention about the lack of data 
          but do the best you can to summarize the board: ${summaries.join('\n')}` }],
      });
      const finalSummary = completion.choices[0].message.content;

      console.log('Final Summary:', finalSummary);
      res.json({ summary: finalSummary, numNotes: numNotes, numFlyers: numFlyers });
    } catch (error) {
      console.error('Error summarizing board:', error);
      res.status(500).json({ message: `Error summarizing board: ${error}` });
    }
  } catch (err) {
    console.error('Error in summarize-ai:', err);
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Create a route to serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
