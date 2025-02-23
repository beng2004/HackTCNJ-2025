# HackTCNJ-2025

This project is a collaborative board application built with Node.js, React, and MongoDB. It allows users to create boards, add posts (notes and flyers), and share them with others!

Created by Christopher Lam & Benjamin Guerrieri

## Features

*   **Boards:** Users can create and manage multiple boards.
*   **Posts:** Boards can contain different types of posts, including notes and flyers.
*   **Real-time Updates:** Implemented using web sockets for instant updates.
*   **User Authentication:** Secure user authentication and authorization.
*   **File Uploads:** Users can upload files to flyers.
*   **AI Summarization:** Boards can be summarized using OpenAI's GPT-3.5 Turbo.

## Technologies Used

*   **Backend:** Node.js, Express, MongoDB
*   **Frontend:** React, HTML/CSS, OAuth
*   **Other:** OpenAI API, ngrok

## Setup

1.  Clone the repository.
2.  Install the dependencies: `npm install`
3.  Set up the MongoDB database and update the connection string in `.env`.
4.  Set up the OpenAI API key in `.env`.
5.  Run the server: `node server/index.js`
6.  Run the command `npm run dev`

## API Endpoints

*   `POST /boards`: Create a new board.
*   `GET /boards`: Get all boards.
*   `POST /posts`: Create a new post.
*   `GET /posts`: Get all posts.
*   `POST /comments`: Create a new comment.
*   `GET /comments`: Get all comments.
*   `POST /upload`: Upload a file.
*   `DELETE /delete-post`: Delete a post.
*   `POST /summarize-ai`: Summarize all posts for a given board using GenAI.
*   `POST /users/addUser`: Create a new user.
*   `POST /users/shareBoard`: Add permissions to a user.

## Models

*   Board
*   Post
*   Flyer
*   Note
*   Comment
*   User
