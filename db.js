const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mcq_system",
  password: "Ans14",
  port: 5432,
});

module.exports = pool;
