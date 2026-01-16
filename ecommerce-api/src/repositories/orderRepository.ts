import { getDb } from '../database/schema';
import { Order, OrderItem, OrderStatus } from '../models/types';

export class OrderRepository {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  create(order: Order): Order {
    this.db.run(
      `INSERT INTO orders (id, customer_id, status, total, shipping_address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order.id, order.customer_id, order.status, order.total, order.shipping_address, order.created_at, order.updated_at]
    );
    return order;
  }

  findById(id: string): Order | null {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToOrder(row);
    }
    stmt.free();
    return null;
  }

  findByCustomerId(customerId: string): Order[] {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC');
    stmt.bind([customerId]);
    
    const results: Order[] = [];
    while (stmt.step()) {
      results.push(this.mapRowToOrder(stmt.getAsObject()));
    }
    stmt.free();
    return results;
  }

  updateStatus(id: string, status: OrderStatus): Order | null {
    const existing = this.findById(id);
    if (!existing) return null;

    this.db.run('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), id]);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    this.db.run('DELETE FROM order_items WHERE order_id = ?', [id]);
    this.db.run('DELETE FROM orders WHERE id = ?', [id]);
    return true;
  }

  private mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      customer_id: row.customer_id,
      status: row.status as OrderStatus,
      total: row.total,
      shipping_address: row.shipping_address,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    };
  }
}

export class OrderItemRepository {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  create(item: OrderItem): OrderItem {
    this.db.run(
      `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.order_id, item.product_id, item.quantity, item.unit_price, item.created_at]
    );
    return item;
  }

  findByOrderId(orderId: string): OrderItem[] {
    const stmt = this.db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    stmt.bind([orderId]);
    
    const results: OrderItem[] = [];
    while (stmt.step()) {
      results.push(this.mapRowToOrderItem(stmt.getAsObject()));
    }
    stmt.free();
    return results;
  }

  private mapRowToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      created_at: row.created_at || new Date().toISOString(),
    };
  }
}
