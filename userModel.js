const bcrypt = require("bcrypt");
const { query } = require("./db");

async function createUser(username, password) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hashedPassword]
    );

    console.log("User created with ID:", result.insertId);
    return result.insertId;
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error("Username already exists");
    }
    throw err;
  }
}

async function verifyUser(username, password) {
  const rows = await query(
    "SELECT password_hash FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0) return false;

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  return valid;
}

module.exports = { createUser, verifyUser };