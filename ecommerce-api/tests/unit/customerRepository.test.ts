import { CustomerRepository } from '../../src/repositories/customerRepository';
import { initializeDatabase, closeDb } from '../../src/database/schema';
import { v4 as uuidv4 } from 'uuid';

describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let testCustomerId: string;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    await initializeDatabase();
    repository = new CustomerRepository();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
  });

  describe('create', () => {
    it('should create a new customer', () => {
      const customer = repository.create({
        id: testCustomerId,
        email: testEmail,
        name: 'Test Customer',
        password_hash: 'hashed_password',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(customer).toBeDefined();
      expect(customer.id).toBe(testCustomerId);
      expect(customer.email).toBe(testEmail);
    });

    it('should throw error for duplicate email', () => {
      expect(() => {
        repository.create({
          id: uuidv4(),
          email: testEmail,
          name: 'Another Customer',
          password_hash: 'hash',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }).toThrow();
    });
  });

  describe('findById', () => {
    it('should find an existing customer', () => {
      const customer = repository.findById(testCustomerId);

      expect(customer).toBeDefined();
      expect(customer?.email).toBe(testEmail);
    });

    it('should return null for non-existent customer', () => {
      const customer = repository.findById(uuidv4());
      expect(customer).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find customer by email', () => {
      const customer = repository.findByEmail(testEmail);

      expect(customer).toBeDefined();
      expect(customer?.name).toBe('Test Customer');
    });

    it('should return null for non-existent email', () => {
      const customer = repository.findByEmail('nonexistent@example.com');
      expect(customer).toBeNull();
    });
  });

  describe('update', () => {
    it('should update customer name', () => {
      const updated = repository.update(testCustomerId, { name: 'Updated Name' });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
    });

    it('should return null for non-existent customer', () => {
      const updated = repository.update(uuidv4(), { name: 'No One' });
      expect(updated).toBeNull();
    });
  });
});
