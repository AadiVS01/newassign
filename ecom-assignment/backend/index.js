const express = require('express');
const cors = require('cors'); // I-import ang cors
const multer = require('multer'); // For file uploads
const path = require('path'); // For file paths
const fs = require('fs'); // For file system operations
const db = require('./database.js'); // I-import ang database connection

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para ma-parse ang JSON body ng requests
app.use(express.json());
app.use(cors()); // Gamitin ang cors middleware

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + extension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// API route para makuha ang lahat ng products
app.get('/api/products', (req, res) => {
  const sql = "SELECT * FROM products";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// API route para makuha ang isang product gamit ang ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    res.json({
      message: 'success',
      data: row
    });
  });
});

// API route para magdagdag ng bagong product (CREATE)
app.post('/api/products', (req, res) => {
  const { name, price, description, imageUrl } = req.body;
  if (!name || !price) {
    res.status(400).json({ error: 'Name and price are required.' });
    return;
  }
  const sql = `INSERT INTO products (name, price, description, imageUrl) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, price, description, imageUrl], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Product added successfully!',
      id: this.lastID
    });
  });
});

// API route para mag-update ng existing product (UPDATE)
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, description, imageUrl } = req.body;
  // Basic validation
  if (!name || !price) {
    res.status(400).json({ error: 'Name and price are required.' });
    return;
  }
  const sql = `UPDATE products SET name = ?, price = ?, description = ?, imageUrl = ? WHERE id = ?`;
  db.run(sql, [name, price, description, imageUrl, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    res.json({
      message: 'Product updated successfully!',
      changes: this.changes
    });
  });
});

// API route para mag-delete ng product (DELETE)
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM products WHERE id = ?`;
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }
    res.json({
      message: 'Product deleted successfully!',
      changes: this.changes
    });
  });
});

// CART API ENDPOINTS
// POST /api/cart - Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    res.status(400).json({ error: 'Product ID is required.' });
    return;
  }

  // Check if product exists
  const checkProductSql = "SELECT * FROM products WHERE id = ?";
  db.get(checkProductSql, [productId], (err, product) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    // Check if item already exists in cart
    const checkCartSql = "SELECT * FROM cart_items WHERE product_id = ?";
    db.get(checkCartSql, [productId], (err, cartItem) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (cartItem) {
        // Update existing cart item
        const updateSql = "UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ?";
        db.run(updateSql, [quantity, productId], function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            message: 'Cart item updated successfully!',
            productId,
            newQuantity: cartItem.quantity + quantity
          });
        });
      } else {
        // Add new cart item
        const insertSql = "INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)";
        db.run(insertSql, [productId, quantity], function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({
            message: 'Item added to cart successfully!',
            cartItemId: this.lastID,
            productId,
            quantity
          });
        });
      }
    });
  });
});

// GET /api/cart - Get cart items and total
app.get('/api/cart', (req, res) => {
  const sql = `
    SELECT 
      ci.id as cart_item_id,
      ci.quantity,
      p.id,
      p.name,
      p.price,
      p.description,
      p.imageUrl,
      (p.price * ci.quantity) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    ORDER BY ci.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = rows.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      message: 'success',
      data: {
        items: rows,
        total: total,
        totalItems: totalItems
      }
    });
  });
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cart_items WHERE id = ?";
  
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }
    res.json({
      message: 'Item removed from cart successfully!',
      changes: this.changes
    });
  });
});

// PUT /api/cart/:id - Update cart item quantity
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: 'Valid quantity is required.' });
    return;
  }
  
  const sql = "UPDATE cart_items SET quantity = ? WHERE id = ?";
  db.run(sql, [quantity, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }
    res.json({
      message: 'Cart item updated successfully!',
      changes: this.changes
    });
  });
});

// POST /api/checkout - Process checkout and create order
app.post('/api/checkout', (req, res) => {
  const { customerInfo, cartItems } = req.body;
  
  if (!customerInfo || !customerInfo.name || !customerInfo.email) {
    res.status(400).json({ error: 'Customer name and email are required.' });
    return;
  }
  
  if (!cartItems || cartItems.length === 0) {
    res.status(400).json({ error: 'Cart items are required.' });
    return;
  }
  
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderItemsJson = JSON.stringify(cartItems);
  
  const insertOrderSql = `
    INSERT INTO orders (customer_name, customer_email, customer_address, customer_city, customer_zip, total_amount, order_items)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertOrderSql, [
    customerInfo.name,
    customerInfo.email,
    customerInfo.address || '',
    customerInfo.city || '',
    customerInfo.zip || '',
    totalAmount,
    orderItemsJson
  ], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Clear the cart after successful checkout
    const clearCartSql = "DELETE FROM cart_items";
    db.run(clearCartSql, [], (err) => {
      if (err) {
        console.error('Error clearing cart:', err.message);
        // Don't return error here as the order was successful
      }
      
      // Return order receipt
      res.json({
        message: 'Order placed successfully!',
        receipt: {
          orderId: this.lastID,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          items: cartItems,
          total: totalAmount,
          timestamp: new Date().toISOString(),
          orderDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      });
    });
  });
});

// GET /api/orders - Get all orders
app.get('/api/orders', (req, res) => {
  const sql = "SELECT * FROM orders ORDER BY created_at DESC";
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// GET /api/orders/:id - Get a specific order
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM orders WHERE id = ?";
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }
    
    res.json({
      message: 'success',
      data: row
    });
  });
});

// Start ng server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
