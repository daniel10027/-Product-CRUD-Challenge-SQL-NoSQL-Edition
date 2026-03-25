// ─── models/Product.js ───────────────────────────────────────────────────────
// Mongoose schema for the Product document (MongoDB / NoSQL)
// Each document is stored in the "products" collection.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    price: {
      type:     Number,
      required: [true, 'Product price is required'],
      min:      [0, 'Price cannot be negative'],
    },
    category: {
      type:    String,
      trim:    true,
      default: null,
    },
    inStock: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
