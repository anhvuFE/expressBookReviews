const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Username is valid if it is a non-empty string
  return typeof username === "string" && username.trim().length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Check if any user matches both the username AND password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Both fields are required
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Provide username and password." });
  }

  if (authenticatedUser(username, password)) {
    // Generate a JWT access token valid for 1 hour
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    // Store the token and username in the session
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "No review provided in the query" });
  }

  // Each user can only have one review per book; adding again updates it
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "The review for the book with ISBN " + isbn + " has been added/updated.",
    reviews: books[isbn].reviews
  });
});

// Delete a book review posted by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book with ISBN " + isbn + " not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review for the ISBN " + isbn + " posted by the user " + username + " deleted.",
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "No review by user " + username + " found for ISBN " + isbn });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
