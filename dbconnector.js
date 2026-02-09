
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "appuser",
  password: "password",
  connectionLimit: 5,
  database: "usersdb",
});
async function query(sql, params) {
  let connection;
  try {
    connection = await pool.getConnection();
    const res = await connection.query(sql, params);
    return res;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

async function close() {
  await pool.end();
}

module.exports = { query, close };
