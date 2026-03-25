// ─── server.js ────────────────────────────────────────────────────────────────
'use strict';
require('dotenv').config();

const express       = require('express');
const mongoose      = require('mongoose');
const { initTable } = require('./config/mysql');
const productRoutes = require('./routes/productRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api', productRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'CRUD Comparison API is running' });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Connect to both databases then start server ────────────────────────────────
const start = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crud-comparison');
    console.log('MongoDB connected');

    // 2. Connect to MySQL and initialize products table
    await initTable();

    // 3. Start HTTP server
    app.listen(PORT, () => {
      console.log(`
  ┌─────────────────────────────────────────────────────┐
  │         CRUD Comparison API is running              │
  ├─────────────────────────────────────────────────────┤
  │  NoSQL (MongoDB)                                    │
  │    POST    /api/nosql/products                      │
  │    GET     /api/nosql/products                      │
  │    GET     /api/nosql/products/:id                  │
  │    PUT     /api/nosql/products/:id                  │
  │    DELETE  /api/nosql/products/:id                  │
  ├─────────────────────────────────────────────────────┤
  │  SQL (MySQL)                                        │
  │    POST    /api/sql/products                        │
  │    GET     /api/sql/products                        │
  │    GET     /api/sql/products/:id                    │
  │    PUT     /api/sql/products/:id                    │
  │    DELETE  /api/sql/products/:id                    │
  └─────────────────────────────────────────────────────┘
      `);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
};

start();
