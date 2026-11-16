const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Provide both username and password" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }
  // Reject duplicate usernames
  if (users.some((user) => user.username === username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1 & 10: Get the book list available in the shop (async-await + Promise)
public_users.get('/', async function (req, res) {
  const getBooks = () => new Promise((resolve) => resolve(books));
  try {
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching the book list" });
  }
});

// Task 2 & 11: Get book details based on ISBN (Promise)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch(() => res.status(404).json({ message: "Book with ISBN " + isbn + " not found" }));
});

// Task 3 & 12: Get book details based on author (Promise)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    const results = {};
    Object.keys(books).forEach((key) => {
      if (books[key].author === author) {
        results[key] = books[key];
      }
    });
    Object.keys(results).length > 0 ? resolve(results) : reject("No match");
  })
    .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
    .catch(() => res.status(404).json({ message: "No books found by author " + author }));
});

// Task 4 & 13: Get all books based on title (Promise)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const results = {};
    Object.keys(books).forEach((key) => {
      if (books[key].title === title) {
        results[key] = books[key];
      }
    });
    Object.keys(results).length > 0 ? resolve(results) : reject("No match");
  })
    .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
    .catch(() => res.status(404).json({ message: "No books found with title " + title }));
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found" });
  }
});

module.exports.general = public_users;
