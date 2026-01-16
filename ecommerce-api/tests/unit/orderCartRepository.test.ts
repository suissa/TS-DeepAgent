import { OrderRepository, OrderItemRepository } from '../../src/repositories/orderRepository';
import { CartRepository } from '../../src/repositories/cartRepository';
import { ProductRepository } from '../../src/repositories/productRepository';
import { CustomerRepository } from '../../src/repositories/customerRepository';
import { initializeDatabase, closeDb } from '../../src/database/schema';
import { v4 as uuidv4 } from 'uuid';

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;
  let cartRepository: CartRepository;
  let productRepository: ProductRepository;
  let customerRepository: CustomerRepository;
  let testCustomerId: string;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    orderRepository = new OrderRepository();
    cartRepository = new CartRepository();
    productRepository = new ProductRepository();
    customerRepository = new CustomerRepository();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
    testProductId = uuidv4();

    customerRepository.create({
      id: testCustomerId,
      email: `order-test-${Date.now()}@example.com`,
      name: 'Order Test Customer',
      password_hash: 'hash',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    productRepository.create({
      id: testProductId,
      name: 'Order Test Product',
      price: 50.00,
      stock: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  describe('create', () => {
    it('should create a new order', () => {
      const order = orderRepository.create({
        id: uuidv4(),
        customer_id: testCustomerId,
        status: 'pending',
        total: 100.00,
        shipping_address: '123 Test St',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(order).toBeDefined();
      expect(order.customer_id).toBe(testCustomerId);
      expect(order.status).toBe('pending');
    });
  });

  describe('findById', () => {
    it('should find an existing order', () => {
      const orderId = uuidv4();
      orderRepository.create({
        id: orderId,
        customer_id: testCustomerId,
        status: 'confirmed',
        total: 200.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const order = orderRepository.findById(orderId);

      expect(order).toBeDefined();
      expect(order?.total).toBe(200.00);
    });
  });

  describe('findByCustomerId', () => {
    it('should find orders by customer', () => {
      const orderId = uuidv4();
      orderRepository.create({
        id: orderId,
        customer_id: testCustomerId,
        status: 'shipped',
        total: 150.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const orders = orderRepository.findByCustomerId(testCustomerId);

      expect(orders).toBeDefined();
      expect(orders.some(o => o.id === orderId)).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', () => {
      const orderId = uuidv4();
      orderRepository.create({
        id: orderId,
        customer_id: testCustomerId,
        status: 'pending',
        total: 75.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const updated = orderRepository.updateStatus(orderId, 'delivered');

      expect(updated?.status).toBe('delivered');
    });
  });
});

describe('CartRepository', () => {
  let cartRepository: CartRepository;
  let productRepository: ProductRepository;
  let customerRepository: CustomerRepository;
  let testCustomerId: string;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    cartRepository = new CartRepository();
    productRepository = new ProductRepository();
    customerRepository = new CustomerRepository();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
    testProductId = uuidv4();

    customerRepository.create({
      id: testCustomerId,
      email: `cart-test-${Date.now()}@example.com`,
      name: 'Cart Test Customer',
      password_hash: 'hash',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    productRepository.create({
      id: testProductId,
      name: 'Cart Test Product',
      price: 30.00,
      stock: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const item = cartRepository.addItem({
        id: uuidv4(),
        customer_id: testCustomerId,
        product_id: testProductId,
        quantity: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
    });
  });

  describe('findByCustomerId', () => {
    it('should find cart items by customer', () => {
      cartRepository.addItem({
        id: uuidv4(),
        customer_id: testCustomerId,
        product_id: testProductId,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const items = cartRepository.findByCustomerId(testCustomerId);

      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const itemId = uuidv4();
      cartRepository.addItem({
        id: itemId,
        customer_id: testCustomerId,
        product_id: testProductId,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const updated = cartRepository.updateQuantity(itemId, 5);

      expect(updated?.quantity).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const itemId = uuidv4();
      cartRepository.addItem({
        id: itemId,
        customer_id: testCustomerId,
        product_id: testProductId,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = cartRepository.removeItem(itemId);

      expect(result).toBe(true);
      expect(cartRepository.findByCustomerId(testCustomerId).length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      cartRepository.addItem({
        id: uuidv4(),
        customer_id: testCustomerId,
        product_id: testProductId,
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = cartRepository.clearCart(testCustomerId);

      expect(result).toBe(true);
      expect(cartRepository.findByCustomerId(testCustomerId).length).toBe(0);
    });
  });
});
