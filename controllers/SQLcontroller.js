// ─── controllers/SQLcontroller.js ────────────────────────────────────────────
// CRUD operations for Products using mysql2 (MySQL / SQL).
// All queries use parameterized statements (?) to prevent SQL injection.
// Every handler is wrapped in try/catch for consistent error responses.

const { pool } = require('../config/mysql');

// ────────────────────────────────────────────────────────────────────────────
// POST /products — Create a new product
// ────────────────────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, price, category = null, inStock = true } = req.body;

    // Manual validation — SQL has no built-in schema validation like Mongoose
    if (!name || price === undefined) {
      return res.status(400).json({
        status:  'fail',
        message: 'name and price are required fields.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        status:  'fail',
        message: 'price must be a non-negative number.',
      });
    }

    // Parameterized INSERT — ? placeholders are safely escaped by mysql2
    const [result] = await pool.execute(
      'INSERT INTO products (name, price, category, inStock) VALUES (?, ?, ?, ?)',
      [name, price, category, inStock]
    );

    // Fetch the newly created row using the auto-incremented ID
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status:  'success',
      message: 'Product created (MySQL)',
      data:    { product: rows[0] },
    });
  } catch (err) {
    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: 'fail', message: 'Duplicate entry.' });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /products — Read all products
// ────────────────────────────────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    // ORDER BY createdAt DESC → newest products first (equivalent to Mongoose sort)
    const [products] = await pool.execute(
      'SELECT * FROM products ORDER BY createdAt DESC'
    );

    res.status(200).json({
      status:  'success',
      source:  'MySQL',
      results: products.length,
      data:    { products },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /products/:id — Read one product by its integer ID
// ────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Validate that the id is a valid integer
    if (isNaN(id)) {
      return res.status(400).json({
        status:  'fail',
        message: `Invalid product id: "${req.params.id}". Must be an integer.`,
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${id}`,
      });
    }

    res.status(200).json({
      status: 'success',
      source: 'MySQL',
      data:   { product: rows[0] },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PUT /products/:id — Update a product
// ────────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        status:  'fail',
        message: `Invalid product id: "${req.params.id}". Must be an integer.`,
      });
    }

    const { name, price, category, inStock } = req.body;

    // Build dynamic SET clause — only update the fields that were provided
    // This avoids overwriting existing data with undefined values
    const fields = [];
    const values = [];

    if (name      !== undefined) { fields.push('name = ?');     values.push(name); }
    if (price     !== undefined) { fields.push('price = ?');    values.push(price); }
    if (category  !== undefined) { fields.push('category = ?'); values.push(category); }
    if (inStock   !== undefined) { fields.push('inStock = ?');  values.push(inStock); }

    if (fields.length === 0) {
      return res.status(400).json({
        status:  'fail',
        message: 'No fields provided to update.',
      });
    }

    // Add the id at the end for the WHERE clause
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // affectedRows === 0 means no row matched the given id
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${id}`,
      });
    }

    // Fetch and return the updated row
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.status(200).json({
      status:  'success',
      message: 'Product updated (MySQL)',
      data:    { product: rows[0] },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE /products/:id — Delete a product
// ────────────────────────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        status:  'fail',
        message: `Invalid product id: "${req.params.id}". Must be an integer.`,
      });
    }

    // Fetch the product first so we can include its name in the response
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${id}`,
      });
    }

    const productName = rows[0].name;

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({
      status:  'success',
      message: `Product "${productName}" deleted (MySQL)`,
      data:    null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
