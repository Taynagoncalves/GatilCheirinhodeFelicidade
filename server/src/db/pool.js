const mysql = require('mysql2/promise');
require('dotenv').config();

const u = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: u.hostname,
  port: Number(u.port),
  user: u.username,
  password: u.password,
  database: u.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
