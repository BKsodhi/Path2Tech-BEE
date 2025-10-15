const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mcq_system",
  password: "Bhavnoor@123",
  port: 5432,
});

module.exports = pool;
