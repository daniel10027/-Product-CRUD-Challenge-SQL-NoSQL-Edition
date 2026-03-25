// ─── config/mysql.js ─────────────────────────────────────────────────────────
// Creates a MySQL connection pool and initializes the products table.
// Uses mysql2/promise for full async/await support.

const mysql = require('mysql2/promise');

// Connection pool — reuses connections for better performance
const pool = mysql.createPool({
  host:               process.env.MYSQL_HOST     || 'localhost',
  user:               process.env.MYSQL_USER     || 'root',
  password:           process.env.MYSQL_PASSWORD || '',
  database:           process.env.MYSQL_DATABASE || 'crud_comparison',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// ── Create the products table if it does not exist ────────────────────────────
const initTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id         INT          AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      price      DECIMAL(10, 2) NOT NULL,
      category   VARCHAR(100) DEFAULT NULL,
      inStock    BOOLEAN      NOT NULL DEFAULT TRUE,
      createdAt  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updatedAt  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('MySQL: products table ready');
};

module.exports = { pool, initTable };
