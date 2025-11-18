const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mcq_system",
<<<<<<< HEAD
  password: "Ans14",
=======
  password: "Bhavnoor@123",
>>>>>>> 731672c03c7038291adfa5a3610d9279fb2131a8
  port: 5432,
});

module.exports = pool;
