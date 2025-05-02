require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: "5432",
  user: "postgres",
  password: process.env.dbpassword,
  database: process.env.db1,
});
pool
  .connect()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = pool;
