// ─── routes/productRoutes.js ──────────────────────────────────────────────────
// Registers two parallel sets of routes — one for MongoDB, one for MySQL.
// Both expose the same REST endpoints under different prefixes:
//   /api/nosql/products  → NoSQLcontroller (Mongoose / MongoDB)
//   /api/sql/products    → SQLcontroller   (mysql2 / MySQL)

const express        = require('express');
const noSQLController = require('../controllers/NoSQLcontroller');
const sqlController   = require('../controllers/SQLcontroller');

const router = express.Router();

// ── NoSQL routes (MongoDB / Mongoose) ────────────────────────────────────────
router.post  ('/nosql/products',      noSQLController.createProduct);
router.get   ('/nosql/products',      noSQLController.getAllProducts);
router.get   ('/nosql/products/:id',  noSQLController.getProductById);
router.put   ('/nosql/products/:id',  noSQLController.updateProduct);
router.delete('/nosql/products/:id',  noSQLController.deleteProduct);

// ── SQL routes (MySQL / mysql2) ───────────────────────────────────────────────
router.post  ('/sql/products',        sqlController.createProduct);
router.get   ('/sql/products',        sqlController.getAllProducts);
router.get   ('/sql/products/:id',    sqlController.getProductById);
router.put   ('/sql/products/:id',    sqlController.updateProduct);
router.delete('/sql/products/:id',    sqlController.deleteProduct);

module.exports = router;
