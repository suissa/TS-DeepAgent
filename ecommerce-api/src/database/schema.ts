import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';

let db: any = null;

export async function initializeDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      shipping_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  console.log('Database initialized successfully');
}

export function seedDatabase(): void {
  if (!db) throw new Error('Database not initialized');

  const products = [
    { id: uuidv4(), name: 'Laptop', description: 'High-performance laptop', price: 999.99, stock: 10, category: 'electronics' },
    { id: uuidv4(), name: 'Smartphone', description: 'Latest smartphone', price: 699.99, stock: 20, category: 'electronics' },
    { id: uuidv4(), name: 'Headphones', description: 'Wireless headphones', price: 149.99, stock: 50, category: 'electronics' },
    { id: uuidv4(), name: 'T-Shirt', description: 'Cotton t-shirt', price: 29.99, stock: 100, category: 'clothing' },
    { id: uuidv4(), name: 'Jeans', description: 'Blue jeans', price: 59.99, stock: 30, category: 'clothing' },
  ];

  for (const product of products) {
    db.run(
      `INSERT OR IGNORE INTO products (id, name, description, price, stock, category) VALUES (?, ?, ?, ?, ?, ?)`,
      [product.id, product.name, product.description, product.price, product.stock, product.category]
    );
  }

  console.log('Database seeded with sample data');
}

export function getDb(): any {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  require('fs').writeFileSync('ecommerce.db', buffer);
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

export { db };
