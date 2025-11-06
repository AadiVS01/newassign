const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ikonekta sa database
// Gumamit ng path.resolve para sa consistency sa iba't ibang OS
const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    // I-log ang error at lumabas kung may problema sa koneksyon
    return console.error('Error connecting to database:', err.message);
  }
  console.log('Connected to the ecommerce SQLite database.');
});

// Gumawa ng mga table
db.serialize(() => {
  // Gumawa ng products table kung wala pa
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    imageUrl TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    } else {
      console.log('Products table checked/created.');
      // Ipasok ang sample products kung walang laman ang table
      db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
        if (err) {
          console.error('Error checking product count:', err.message);
          return;
        }
        if (row.count === 0) {
          console.log('Inserting sample products...');
          const insert = db.prepare(`INSERT INTO products (name, price, description, imageUrl) VALUES (?, ?, ?, ?)`);
          insert.run("MacBook Pro 16-inch", 89999, "Apple M3 Pro chip with 12-core CPU and 18-core GPU. 18GB unified memory, 512GB SSD storage. Perfect for professionals and creatives.", "laptop.jpg");
          insert.run("Sony WH-1000XM5", 15999, "Industry-leading noise canceling wireless headphones with 30-hour battery life and premium sound quality.", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&q=80");
          insert.run("iPhone 15 Pro", 54999, "Titanium design with A17 Pro chip, Pro camera system, and Action Button. Available in Natural Titanium.", "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop&q=80");
          insert.run("Dell UltraSharp 27\" 4K Monitor", 24999, "27-inch 4K UHD monitor with HDR400, 99% sRGB color coverage, and USB-C connectivity for professionals.", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop&q=80");
          insert.run("Logitech MX Master 3S", 4299, "Advanced wireless mouse with ultra-fast scrolling, customizable buttons, and precision tracking on any surface.", "mouse.jpg");
          insert.run("Apple Magic Keyboard", 8999, "Wireless keyboard with scissor mechanism and numeric keypad. Pairs automatically with your Mac.", "keyboard.jpeg");
          insert.run("AirPods Pro (2nd Gen)", 12999, "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio with up to 30 hours of listening time.", "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=400&fit=crop&q=80");
          insert.run("Gaming Laptop RTX 4080", 124999, "High-performance gaming laptop with RTX 4080, Intel i9 processor, 32GB RAM, and 1TB NVMe SSD for ultimate gaming experience.", "gaminglaptop.jpg");
          insert.run("Professional Laptop", 67999, "Sleek business laptop with premium build quality, all-day battery life, and enterprise-grade security features.", "laptop5.jpg");
          insert.run("Wireless Gaming Mouse", 3499, "Precision gaming mouse with customizable RGB lighting, ultra-fast wireless connection, and ergonomic design.", "mouse2.jpeg");
          insert.run("Premium Gaming Mouse", 5999, "Professional esports mouse with ultra-precise sensor, customizable weights, and tournament-grade performance.", "mouse3.jpeg");
          insert.run("Mechanical Gaming Keyboard", 12999, "RGB backlit mechanical keyboard with cherry MX switches, programmable keys, and premium aluminum construction.", "keyboard2.webp");
          insert.run("Wireless Keyboard Pro", 7999, "Slim wireless keyboard with premium key switches, long battery life, and elegant design for professionals.", "keyboard3.jpeg");
          insert.finalize(() => {
            console.log('Sample products inserted.');
          });
        } else {
          console.log('Products table already has data.');
        }
      });
    }
  });

  // Create cart table for persistent cart storage
  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating cart_items table:', err.message);
    } else {
      console.log('Cart items table checked/created.');
    }
  });

  // Create orders table for checkout history
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    customer_city TEXT,
    customer_zip TEXT,
    total_amount REAL NOT NULL,
    order_items TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating orders table:', err.message);
    } else {
      console.log('Orders table checked/created.');
    }
  });
});

module.exports = db;