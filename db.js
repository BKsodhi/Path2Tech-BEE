const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Path2Tech",
  password: "Bhavnoor@123",
  port: 5432,
});

module.exports = pool;
