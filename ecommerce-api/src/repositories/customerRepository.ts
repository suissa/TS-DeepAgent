import { getDb } from '../database/schema';
import { Customer } from '../models/types';

export class CustomerRepository {
  private db: any;

  constructor() {
    this.db = getDb();
  }

  create(customer: Customer): Customer {
    try {
      this.db.run(
        `INSERT INTO customers (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [customer.id, customer.email, customer.name, customer.password_hash, customer.created_at, customer.updated_at]
      );
      return customer;
    } catch (error: any) {
      if (error.message && error.message.includes('UNIQUE constraint')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  findById(id: string): Customer | null {
    const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToCustomer(row);
    }
    stmt.free();
    return null;
  }

  findByEmail(email: string): Customer | null {
    const stmt = this.db.prepare('SELECT * FROM customers WHERE email = ?');
    stmt.bind([email]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToCustomer(row);
    }
    stmt.free();
    return null;
  }

  update(id: string, data: Partial<Customer>): Customer | null {
    const existing = this.findById(id);
    if (!existing) return null;

    if (data.name) {
      this.db.run('UPDATE customers SET name = ?, updated_at = ? WHERE id = ?', 
        [data.name, new Date().toISOString(), id]);
    }

    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;

    this.db.run('DELETE FROM customers WHERE id = ?', [id]);
    return true;
  }

  private mapRowToCustomer(row: any): Customer {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password_hash: row.password_hash,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString(),
    };
  }
}
