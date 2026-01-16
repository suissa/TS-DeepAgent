import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { Customer, CreateCustomerInput, LoginInput } from '../models/types';
import { CustomerRepository } from '../repositories/customerRepository';

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  registerCustomer(input: CreateCustomerInput): Customer {
    if (!this.isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }
    if (input.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const customer: Customer = {
      id: uuidv4(),
      email: input.email,
      name: input.name,
      password_hash: this.hashPassword(input.password),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.repository.create(customer);
  }

  authenticate(email: string, password: string): { token: string; customer: Customer } {
    const customer = this.repository.findByEmail(email);
    if (!customer) {
      throw new Error('Invalid credentials');
    }

    if (!this.verifyPassword(password, customer.password_hash)) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(customer.id);

    return { token, customer: this.sanitizeCustomer(customer) };
  }

  getCustomer(id: string): Customer | null {
    const customer = this.repository.findById(id);
    return customer ? this.sanitizeCustomer(customer) : null;
  }

  updateCustomer(id: string, name: string): Customer | null {
    return this.repository.update(id, { name });
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  private generateToken(customerId: string): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private sanitizeCustomer(customer: Customer): Customer {
    const { password_hash, ...sanitized } = customer;
    return sanitized as Customer;
  }
}
