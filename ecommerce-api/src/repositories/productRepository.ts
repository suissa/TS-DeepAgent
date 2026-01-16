import { getDb } from '../database/schema';
import { Product } from '../models/types';

export class ProductRepository {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  create(product: Product): Product {
    try {
      this.db.run(
        `INSERT INTO products (id, name, description, price, stock, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.description, product.price, product.stock, product.category, product.created_at, product.updated_at]
      );
      return product;
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint')) {
        throw new Error('Product already exists');
      }
      throw error;
    }
  }

  findById(id: string): Product | null {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToProduct(row);
    }
    stmt.free();
    return null;
  }

  findAll(filters?: { category?: string; min_price?: number; max_price?: number }): Product[] {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters?.min_price !== undefined) {
      query += ' AND price >= ?';
      params.push(filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      query += ' AND price <= ?';
      params.push(filters.max_price);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = this.db.prepare(query);
    if (params.length > 0) {
      stmt.bind(params);
    }
    
    const results: Product[] = [];
    while (stmt.step()) {
      results.push(this.mapRowToProduct(stmt.getAsObject()));
    }
    stmt.free();
    return results;
  }

  findAllPaginated(
    filters?: { category?: string; min_price?: number; max_price?: number },
    page: number = 1,
    limit: number = 10
  ): { products: Product[]; total: number; page: number; totalPages: number } {
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const countParams: any[] = [];

    if (filters?.category) {
      countQuery += ' AND category = ?';
      countParams.push(filters.category);
    }
    if (filters?.min_price !== undefined) {
      countQuery += ' AND price >= ?';
      countParams.push(filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      countQuery += ' AND price <= ?';
      countParams.push(filters.max_price);
    }

    const countStmt = this.db.prepare(countQuery);
    if (countParams.length > 0) {
      countStmt.bind(countParams);
    }
    countStmt.step();
    const countRow = countStmt.getAsObject();
    const total = countRow.count as number;
    countStmt.free();

    let dataQuery = 'SELECT * FROM products WHERE 1=1';
    const dataParams: any[] = [];

    if (filters?.category) {
      dataQuery += ' AND category = ?';
      dataParams.push(filters.category);
    }
    if (filters?.min_price !== undefined) {
      dataQuery += ' AND price >= ?';
      dataParams.push(filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      dataQuery += ' AND price <= ?';
      dataParams.push(filters.max_price);
    }

    const offset = (page - 1) * limit;
    dataQuery += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    dataParams.push(limit, offset);

    const dataStmt = this.db.prepare(dataQuery);
    if (dataParams.length > 0) {
      dataStmt.bind(dataParams);
    }

    const products: Product[] = [];
    while (dataStmt.step()) {
      products.push(this.mapRowToProduct(dataStmt.getAsObject()));
    }
    dataStmt.free();

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  update(id: string, data: Partial<Product>): Product | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) { updates.push('name = ?'); params.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
    if (data.price !== undefined) { updates.push('price = ?'); params.push(data.price); }
    if (data.stock !== undefined) { updates.push('stock = ?'); params.push(data.stock); }
    if (data.category !== undefined) { updates.push('category = ?'); params.push(data.category); }
    
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    this.db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    this.db.run('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }

  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    };
  }
}
