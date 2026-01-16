import { ProductService } from '../../src/services/productService';
import { CustomerService } from '../../src/services/customerService';
import { OrderService } from '../../src/services/orderService';
import { CartService } from '../../src/services/cartService';
import { initializeDatabase, closeDb } from '../../src/database/schema';
import { v4 as uuidv4 } from 'uuid';

describe('ProductService', () => {
  let service: ProductService;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    service = new ProductService();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testProductId = uuidv4();
  });

  describe('createProduct', () => {
    it('should create a product with valid input', () => {
      const product = service.createProduct({
        name: 'New Product',
        description: 'Description',
        price: 99.99,
        stock: 10,
        category: 'test',
      });

      expect(product).toBeDefined();
      expect(product.name).toBe('New Product');
      expect(product.price).toBe(99.99);
    });

    it('should throw error for negative price', () => {
      expect(() => {
        service.createProduct({
          name: 'Invalid Product',
          price: -10,
          stock: 5,
        });
      }).toThrow();
    });

    it('should throw error for negative stock', () => {
      expect(() => {
        service.createProduct({
          name: 'Invalid Stock',
          price: 50,
          stock: -5,
        });
      }).toThrow();
    });
  });

  describe('getProduct', () => {
    it('should get product by id', () => {
      const created = service.createProduct({
        name: 'Get Me',
        price: 25.00,
        stock: 5,
      });

      const found = service.getProduct(created.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Get Me');
    });

    it('should return null for non-existent product', () => {
      const found = service.getProduct(uuidv4());
      expect(found).toBeNull();
    });
  });

  describe('listProducts', () => {
    it('should list products with filters', () => {
      const result = service.listProducts({ category: 'electronics' });

      expect(Array.isArray(result.products)).toBe(true);
    });

    it('should paginate results', () => {
      const result = service.listProducts({}, 1, 5);
      expect(result.products.length).toBeLessThanOrEqual(5);
    });
  });

  describe('updateProduct', () => {
    it('should update product', () => {
      const created = service.createProduct({
        name: 'To Update',
        price: 100.00,
        stock: 5,
      });

      const updated = service.updateProduct(created.id, { price: 150.00 });

      expect(updated?.price).toBe(150.00);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', () => {
      const created = service.createProduct({
        name: 'To Delete',
        price: 50.00,
        stock: 3,
      });

      const result = service.deleteProduct(created.id);

      expect(result).toBe(true);
    });
  });
});

describe('CustomerService', () => {
  let service: CustomerService;
  let testCustomerId: string;

  beforeAll(async () => {
    await initializeDatabase();
    service = new CustomerService();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
  });

  describe('registerCustomer', () => {
    it('should register a new customer', () => {
      const customer = service.registerCustomer({
        email: `new-${Date.now()}@example.com`,
        name: 'New Customer',
        password: 'password123',
      });

      expect(customer).toBeDefined();
      expect(customer.name).toBe('New Customer');
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        service.registerCustomer({
          email: 'invalid-email',
          name: 'Test',
          password: 'password123',
        });
      }).toThrow();
    });

    it('should throw error for short password', () => {
      expect(() => {
        service.registerCustomer({
          email: 'test@example.com',
          name: 'Test',
          password: '123',
        });
      }).toThrow();
    });
  });

  describe('authenticate', () => {
    it('should authenticate with correct credentials', () => {
      const email = `auth-${Date.now()}@example.com`;
      service.registerCustomer({
        email,
        name: 'Auth Test',
        password: 'correctpassword',
      });

      const result = service.authenticate(email, 'correctpassword');

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should fail with incorrect password', () => {
      const email = `auth-fail-${Date.now()}@example.com`;
      service.registerCustomer({
        email,
        name: 'Auth Fail',
        password: 'correctpassword',
      });

      expect(() => {
        service.authenticate(email, 'wrongpassword');
      }).toThrow();
    });
  });
});

describe('OrderService', () => {
  let orderService: OrderService;
  let cartService: CartService;
  let productService: ProductService;
  let customerService: CustomerService;
  let testCustomerId: string;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    orderService = new OrderService();
    cartService = new CartService();
    productService = new ProductService();
    customerService = new CustomerService();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
    testProductId = uuidv4();

    const customer = customerService.registerCustomer({
      email: `order-${Date.now()}@example.com`,
      name: 'Order Test',
      password: 'password',
    });
    testCustomerId = customer.id;

    const product = productService.createProduct({
      name: 'Order Product',
      price: 50.00,
      stock: 10,
    });
    testProductId = product.id;

    cartService.addToCart(testCustomerId, testProductId, 2);
  });

  describe('createOrder', () => {
    it('should create order from cart', () => {
      const order = orderService.createOrder(testCustomerId, '123 Main St');

      expect(order).toBeDefined();
      expect(order.status).toBe('pending');
      expect(order.total).toBe(100.00);
    });

    it('should clear cart after order', () => {
      const customer = customerService.registerCustomer({
        email: `order-clear-${Date.now()}@example.com`,
        name: 'Order Clear',
        password: 'password',
      });
      const product = productService.createProduct({
        name: 'Clear Product',
        price: 30.00,
        stock: 5,
      });
      cartService.addToCart(customer.id, product.id, 2);
      orderService.createOrder(customer.id, 'Address');

      const cart = cartService.getCart(customer.id);
      expect(cart.length).toBe(0);
    });
  });

  describe('getOrder', () => {
    it('should get order by id', () => {
      const created = orderService.createOrder(testCustomerId, 'Address');
      const found = orderService.getOrder(created.id, testCustomerId);

      expect(found).toBeDefined();
    });
  });

  describe('listCustomerOrders', () => {
    it('should list customer orders', () => {
      orderService.createOrder(testCustomerId, 'Address 1');
      orderService.createOrder(testCustomerId, 'Address 2');

      const orders = orderService.listCustomerOrders(testCustomerId);

      expect(orders.length).toBe(2);
    });
  });
});

describe('CartService', () => {
  let service: CartService;
  let productService: ProductService;
  let customerService: CustomerService;
  let testCustomerId: string;
  let testProductId: string;

  beforeAll(async () => {
    await initializeDatabase();
    service = new CartService();
    productService = new ProductService();
    customerService = new CustomerService();
  });

  afterAll(async () => {
    await closeDb();
  });

  beforeEach(() => {
    testCustomerId = uuidv4();
    testProductId = uuidv4();

    const customer = customerService.registerCustomer({
      email: `cart-${Date.now()}@example.com`,
      name: 'Cart Test',
      password: 'password',
    });
    testCustomerId = customer.id;

    const product = productService.createProduct({
      name: 'Cart Product',
      price: 25.00,
      stock: 20,
    });
    testProductId = product.id;
  });

  describe('addToCart', () => {
    it('should add item to cart', () => {
      const item = service.addToCart(testCustomerId, testProductId, 2);

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
    });

    it('should update quantity if product already in cart', () => {
      service.addToCart(testCustomerId, testProductId, 2);
      const updated = service.addToCart(testCustomerId, testProductId, 3);

      expect(updated.quantity).toBe(5);
    });
  });

  describe('getCart', () => {
    it('should return cart items', () => {
      service.addToCart(testCustomerId, testProductId, 1);
      const cart = service.getCart(testCustomerId);

      expect(cart.length).toBe(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      service.addToCart(testCustomerId, testProductId, 1);
      const updated = service.updateQuantity(testCustomerId, testProductId, 10);

      expect(updated?.quantity).toBe(10);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      service.addToCart(testCustomerId, testProductId, 1);
      const result = service.removeFromCart(testCustomerId, testProductId);

      expect(result).toBe(true);
      expect(service.getCart(testCustomerId).length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      service.addToCart(testCustomerId, testProductId, 1);
      service.clearCart(testCustomerId);

      expect(service.getCart(testCustomerId).length).toBe(0);
    });
  });
});
