const express = require("express");
const app = express();
const port = 3000;
const database = require("./dbconnector.js");
const OpenAI = require("openai");
const { createUser, verifyUser } = require("./userModel.js");
const path = require("path");

app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});


// user routes

app.get("/Users", async (req, res) => {
  let query = "SELECT * FROM users;";

  try {
    let users = await database.query(query);
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

app.post("/Users", async (req, res) => {
  let { username, email, password } = req.body;
  let query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?);";

  try {
    let result = await database.query(query, [username, email, password]);
    res.send({ message: "User created", id: Number(result.insertId) });
  } catch (error) {
    res.send(error);
  }
});

app.delete("/Users/:id", async (req, res) => {
  let id = req.params.id;
  let query = "DELETE FROM users WHERE id = ?;";

  try {
    let result = await database.query(query, [id]);
    res.send({ message: "User deleted", affectedRows: result.affectedRows });
  } catch (error) {
    res.send(error);
  }
});

app.put("/Users/:id", async (req, res) => {
  let id = req.params.id;
  let { username, email, password } = req.body;
  let query = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?;";

  try {
    let result = await database.query(query, [username, email, password, id]);
    res.send({ message: "User updated", affectedRows: result.affectedRows });
  } catch (error) {
    res.send(error);
  }
});


// auth routes

app.post("/register", async (req, res) => {
  let { username, password } = req.body;

  try {
    let id = await createUser(username, password);
    res.send({ message: "User registered", id: Number(id) });
  } catch (error) {
    res.send({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;

  try {
    let valid = await verifyUser(username, password);

    if (valid) {
      res.send({ message: "Login successful" });
    } else {
      res.send({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.send({ message: error.message });
  }
});


// book routes

app.get("/Books", async (req, res) => {
  let query = "SELECT * FROM books;";

  try {
    let books = await database.query(query);
    res.send(books);
  } catch (error) {
    res.send(error);
  }
});

app.get("/Books/user/:userId", async (req, res) => {
  let userId = req.params.userId;
  let query = "SELECT * FROM books WHERE user_id = ?;";

  try {
    let books = await database.query(query, [userId]);
    res.send(books);
  } catch (error) {
    res.send(error);
  }
});

app.post("/Books", async (req, res) => {
  let { user_id, title, author, status, date_added } = req.body;
  let query = "INSERT INTO books (user_id, title, author, status, date_added) VALUES (?, ?, ?, ?, ?);";

  try {
    let result = await database.query(query, [user_id, title, author, status, date_added]);
    res.send({ message: "Book added", id: Number(result.insertId) });
  } catch (error) {
    res.send(error);
  }
});

app.put("/Books/:id", async (req, res) => {
  let id = req.params.id;
  let { status, date_finished, review } = req.body;
  let query = "UPDATE books SET status = ?, date_finished = ?, review = ? WHERE id = ?;";

  try {
    let result = await database.query(query, [status, date_finished, review, id]);
    res.send({ message: "Book updated", affectedRows: result.affectedRows });
  } catch (error) {
    res.send(error);
  }
});

app.delete("/Books/:id", async (req, res) => {
  let id = req.params.id;
  let query = "DELETE FROM books WHERE id = ?;";

  try {
    let result = await database.query(query, [id]);
    res.send({ message: "Book deleted", affectedRows: result.affectedRows });
  } catch (error) {
    res.send(error);
  }
});


// ai summary route

app.get("/Books/:id/summary", async (req, res) => {
  let id = req.params.id;
  let query = "SELECT title, author FROM books WHERE id = ?;";

  try {
    if (!openai) return res.send({ message: "OpenAI API key not set" });

    let books = await database.query(query, [id]);

    if (books.length === 0) return res.send({ message: "Book not found" });

    let { title, author } = books[0];

    let response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Give me a short 3-4 sentence summary of the book "${title}" by ${author}. Keep it spoiler-free and beginner friendly.`,
        },
      ],
    });

    let summary = response.choices[0].message.content;
    res.send({ title, author, summary });
  } catch (error) {
    res.send(error);
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});