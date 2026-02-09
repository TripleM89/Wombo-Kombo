const express = require("express");
const app = express();
const port = 3000;
const database = require("./dbconnector.js");

app.get("/", (req, res) => {
  res.send("private saker");
});


app.get("/Users", async (req, res) => {
  let query = "SELECT * FROM users;";

  try {
    let users = await database.query(query);

    res.send(users);
  } catch (error) {
    res.send(error);
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});