import { getDb } from '../database/schema';
import { CartItem } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class CartRepository {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  addItem(item: CartItem): CartItem {
    const existing = this.findByCustomerAndProduct(item.customer_id, item.product_id);
    if (existing) {
      return this.updateQuantity(existing.id, existing.quantity + item.quantity)!;
    }

    try {
      this.db.run(
        `INSERT INTO cart_items (id, customer_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [item.id, item.customer_id, item.product_id, item.quantity, item.created_at, item.updated_at]
      );
      return item;
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint')) {
        return this.updateQuantity(item.id, item.quantity)!;
      }
      throw error;
    }
  }

  findById(id: string): CartItem | null {
    const stmt = this.db.prepare('SELECT * FROM cart_items WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToCartItem(row);
    }
    stmt.free();
    return null;
  }

  findByCustomerId(customerId: string): CartItem[] {
    const stmt = this.db.prepare('SELECT * FROM cart_items WHERE customer_id = ?');
    stmt.bind([customerId]);
    
    const results: CartItem[] = [];
    while (stmt.step()) {
      results.push(this.mapRowToCartItem(stmt.getAsObject()));
    }
    stmt.free();
    return results;
  }

  findByCustomerAndProduct(customerId: string, productId: string): CartItem | null {
    const stmt = this.db.prepare('SELECT * FROM cart_items WHERE customer_id = ? AND product_id = ?');
    stmt.bind([customerId, productId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToCartItem(row);
    }
    stmt.free();
    return null;
  }

  updateQuantity(id: string, quantity: number): CartItem | null {
    const existing = this.findById(id);
    if (!existing) return null;

    this.db.run('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?',
      [quantity, new Date().toISOString(), id]);

    return this.findById(id);
  }

  updateQuantityByProduct(customerId: string, productId: string, quantity: number): CartItem | null {
    const existing = this.findByCustomerAndProduct(customerId, productId);
    if (!existing) return null;

    return this.updateQuantity(existing.id, quantity);
  }

  removeItem(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    this.db.run('DELETE FROM cart_items WHERE id = ?', [id]);
    return true;
  }

  removeByProduct(customerId: string, productId: string): boolean {
    const existing = this.findByCustomerAndProduct(customerId, productId);
    if (!existing) return false;

    return this.removeItem(existing.id);
  }

  clearCart(customerId: string): boolean {
    this.db.run('DELETE FROM cart_items WHERE customer_id = ?', [customerId]);
    return true;
  }

  private mapRowToCartItem(row: any): CartItem {
    return {
      id: row.id,
      customer_id: row.customer_id,
      product_id: row.product_id,
      quantity: row.quantity,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    };
  }
}
