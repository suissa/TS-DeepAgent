import { ProductRepository } from '../../src/repositories/productRepository';
import { initializeDatabase, closeDb } from '../../src/database/schema';
import { v4 as uuidv4 } from 'uuid';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    repository = new ProductRepository();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testProductId = uuidv4();
  });

  describe('create', () => {
    it('should create a new product', () => {
      const product = repository.create({
        id: testProductId,
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        stock: 10,
        category: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(product).toBeDefined();
      expect(product.id).toBe(testProductId);
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(99.99);
    });

    it('should throw error for duplicate ID', () => {
      expect(() => {
        repository.create({
          id: testProductId,
          name: 'Duplicate Product',
          price: 50.00,
          stock: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }).toThrow();
    });
  });

  describe('findById', () => {
    it('should find an existing product', () => {
      repository.create({
        id: testProductId,
        name: 'Find Me',
        price: 75.00,
        stock: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const product = repository.findById(testProductId);

      expect(product).toBeDefined();
      expect(product?.name).toBe('Find Me');
    });

    it('should return null for non-existent product', () => {
      const product = repository.findById(uuidv4());
      expect(product).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all products', () => {
      const products = repository.findAll();

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it('should filter by category', () => {
      const electronics = repository.findAll({ category: 'electronics' });

      expect(electronics.every(p => p.category === 'electronics')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an existing product', () => {
      repository.create({
        id: testProductId,
        name: 'To Update',
        price: 100.00,
        stock: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const updated = repository.update(testProductId, { price: 150.00 });

      expect(updated).toBeDefined();
      expect(updated?.price).toBe(150.00);
    });

    it('should return null for non-existent product', () => {
      const updated = repository.update(uuidv4(), { price: 100.00 });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing product', () => {
      repository.create({
        id: testProductId,
        name: 'To Delete',
        price: 25.00,
        stock: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = repository.delete(testProductId);

      expect(result).toBe(true);
      expect(repository.findById(testProductId)).toBeNull();
    });

    it('should return false for non-existent product', () => {
      const result = repository.delete(uuidv4());
      expect(result).toBe(false);
    });
  });
});
