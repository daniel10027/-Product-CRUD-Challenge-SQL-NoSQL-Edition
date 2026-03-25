// ─── controllers/NoSQLcontroller.js ──────────────────────────────────────────
// CRUD operations for Products using Mongoose (MongoDB / NoSQL).
// Every handler is wrapped in try/catch for consistent error responses.

const Product = require('../models/Product');

// ────────────────────────────────────────────────────────────────────────────
// POST /products — Create a new product
// ────────────────────────────────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;

    // Validate required fields before hitting Mongoose
    if (!name || price === undefined) {
      return res.status(400).json({
        status:  'fail',
        message: 'name and price are required fields.',
      });
    }

    // Mongoose validates the data against the schema and saves the document
    const product = await Product.create({ name, price, category, inStock });

    res.status(201).json({
      status:  'success',
      message: 'Product created (MongoDB)',
      data:    { product },
    });
  } catch (err) {
    // Handle Mongoose validation errors (e.g. price < 0, name too long)
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'fail', message: messages.join('. ') });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /products — Read all products
// ────────────────────────────────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    // .sort('-createdAt') returns newest products first
    const products = await Product.find().sort('-createdAt');

    res.status(200).json({
      status:  'success',
      source:  'MongoDB',
      results: products.length,
      data:    { products },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// GET /products/:id — Read one product by its MongoDB _id
// ────────────────────────────────────────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      status: 'success',
      source: 'MongoDB',
      data:   { product },
    });
  } catch (err) {
    // Handle invalid ObjectId format (e.g. /products/not-a-valid-id)
    if (err.name === 'CastError') {
      return res.status(400).json({
        status:  'fail',
        message: `Invalid product id format: "${req.params.id}"`,
      });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// PUT /products/:id — Update a product
// ────────────────────────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { name, price, category, inStock } = req.body;

    // Build update object — only include fields that were sent
    const updates = {};
    if (name      !== undefined) updates.name     = name;
    if (price     !== undefined) updates.price    = price;
    if (category  !== undefined) updates.category = category;
    if (inStock   !== undefined) updates.inStock  = inStock;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status:  'fail',
        message: 'No fields provided to update.',
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new:            true,  // return the updated document (not the old one)
        runValidators:  true,  // run schema validators on the update
      }
    );

    if (!product) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      status:  'success',
      message: 'Product updated (MongoDB)',
      data:    { product },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ status: 'fail', message: messages.join('. ') });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'fail', message: `Invalid id: "${req.params.id}"` });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ────────────────────────────────────────────────────────────────────────────
// DELETE /products/:id — Delete a product
// ────────────────────────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status:  'fail',
        message: `No product found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      status:  'success',
      message: `Product "${product.name}" deleted (MongoDB)`,
      data:    null,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ status: 'fail', message: `Invalid id: "${req.params.id}"` });
    }
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
