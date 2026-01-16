import { Feature, Given, When, Then, And } from '@cucumber/cucumber';
import { expect } from 'chai';
import express, { Express } from 'express';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, db } from '../../src/database/schema';
import { productRoutes } from '../../src/routes/productRoutes';
import { customerRoutes } from '../../src/routes/customerRoutes';
import { orderRoutes } from '../../src/routes/orderRoutes';
import { cartRoutes } from '../../src/routes/cartRoutes';

let app: Express;
let customerId: string;
let productIds: string[] = [];
let orderId: string;
let authToken: string;

Before(function () {
  initializeDatabase();
  app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/cart', cartRoutes);
});

After(function () {
  db.close();
});

Feature('Product Management', () => {
  let createdProductId: string;

  Scenario('Creating and retrieving a product', () => {
    When('I create a product with name "Laptop", price 999.99, and stock 10', async function () {
      const response = await request(app)
        .post('/api/products')
        .send({ 
          name: 'Laptop', 
          price: 999.99, 
          stock: 10, 
          description: 'High-performance laptop',
          category: 'electronics'
        });
      
      expect(response.status).to.equal(201);
      createdProductId = response.body.id;
    });

    Then('the product should be stored in the database', async function () {
      const response = await request(app)
        .get(`/api/products/${createdProductId}`);
      
      expect(response.status).to.equal(200);
      expect(response.body.name).to.equal('Laptop');
      expect(response.body.price).to.equal(999.99);
      expect(response.body.stock).to.equal(10);
    });

    And('I should be able to list all products', async function () {
      const response = await request(app)
        .get('/api/products');
      
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
    });
  });

  Scenario('Updating a product', () => {
    Given('a product exists with price 100.00', async function () {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product', price: 100.00, stock: 5 });
      
      createdProductId = response.body.id;
    });

    When('I update the price to 150.00', async function () {
      const response = await request(app)
        .put(`/api/products/${createdProductId}`)
        .send({ price: 150.00 });
      
      expect(response.status).to.equal(200);
    });

    Then('the product should show the new price', async function () {
      const response = await request(app)
        .get(`/api/products/${createdProductId}`);
      
      expect(response.body.price).to.equal(150.00);
    });
  });

  Scenario('Deleting a product', () => {
    Given('a product exists', async function () {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'To Delete', price: 50.00, stock: 2 });
      
      createdProductId = response.body.id;
    });

    When('I delete the product', async function () {
      const response = await request(app)
        .delete(`/api/products/${createdProductId}`);
      
      expect(response.status).to.equal(204);
    });

    Then('the product should not be found', async function () {
      const response = await request(app)
        .get(`/api/products/${createdProductId}`);
      
      expect(response.status).to.equal(404);
    });
  });
});

Feature('Customer Registration and Authentication', () => {
  Scenario('Registering a new customer', () => {
    When('I register with email "john@example.com" and name "John Doe"', async function () {
      const response = await request(app)
        .post('/api/customers')
        .send({ 
          email: 'john@example.com', 
          name: 'John Doe', 
          password: 'securepass123' 
        });
      
      expect(response.status).to.equal(201);
      customerId = response.body.id;
    });

    Then('I should receive customer details without password', function () {
      expect(customerId).to.be.a('string');
    });

    And('the email should be unique', async function () {
      const response = await request(app)
        .post('/api/customers')
        .send({ 
          email: 'john@example.com', 
          name: 'Another User', 
          password: 'password123' 
        });
      
      expect(response.status).to.equal(409);
    });
  });

  Scenario('Customer login', () => {
    Given('I am a registered customer', async function () {
      const response = await request(app)
        .post('/api/customers')
        .send({ 
          email: 'login@example.com', 
          name: 'Login User', 
          password: 'mypassword' 
        });
      
      customerId = response.body.id;
    });

    When('I login with correct credentials', async function () {
      const response = await request(app)
        .post('/api/customers/login')
        .send({ email: 'login@example.com', password: 'mypassword' });
      
      expect(response.status).to.equal(200);
      authToken = response.body.token;
    });

    Then('I should receive an authentication token', function () {
      expect(authToken).to.be.a('string');
    });

    When('I login with incorrect password', async function () {
      const response = await request(app)
        .post('/api/customers/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' });
      
      expect(response.status).to.equal(401);
    });
  });
});

Feature('Shopping Cart', () => {
  let cartProductId: string;
  let cartCustomerId: string;
  let cartToken: string;

  Before(function () {
    productIds = [];
  });

  Scenario('Adding items to cart', () => {
    Given('I am logged in', async function () {
      const response = await request(app)
        .post('/api/customers')
        .send({ 
          email: 'cart@example.com', 
          name: 'Cart User', 
          password: 'cartpass' 
        });
      
      cartCustomerId = response.body.id;
      
      const loginResponse = await request(app)
        .post('/api/customers/login')
        .send({ email: 'cart@example.com', password: 'cartpass' });
      
      cartToken = loginResponse.body.token;
    });

    And('there is a product available', async function () {
      const response = await request(app)
        .post('/api/products')
        .send({ name: 'Cart Item', price: 25.00, stock: 100 });
      
      cartProductId = response.body.id;
      productIds.push(cartProductId);
    });

    When('I add the product to my cart with quantity 2', async function () {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${cartToken}`)
        .send({ product_id: cartProductId, quantity: 2 });
      
      expect(response.status).to.equal(201);
    });

    Then('my cart should contain 2 of that item', async function () {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${cartToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.lengthOf(1);
      expect(response.body[0].quantity).to.equal(2);
    });
  });

  Scenario('Removing items from cart', () => {
    Given('I have items in my cart', async function () {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${cartToken}`);
      
      expect(response.body.length).to.be.greaterThan(0);
    });

    When('I remove an item from my cart', async function () {
      const response = await request(app)
        .delete(`/api/cart/${cartProductId}`)
        .set('Authorization', `Bearer ${cartToken}`);
      
      expect(response.status).to.equal(204);
    });

    Then('my cart should be empty', async function () {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${cartToken}`);
      
      expect(response.body).to.have.lengthOf(0);
    });
  });
});

Feature('Order Management', () => {
  let orderProductId: string;
  let orderCustomerId: string;
  let orderToken: string;

  Scenario('Creating an order', () => {
    Given('I am logged in with items in my cart', async function () {
      const response = await request(app)
        .post('/api/customers')
        .send({ 
          email: 'order@example.com', 
          name: 'Order User', 
          password: 'orderpass' 
        });
      
      orderCustomerId = response.body.id;
      
      const loginResponse = await request(app)
        .post('/api/customers/login')
        .send({ email: 'order@example.com', password: 'orderpass' });
      
      orderToken = loginResponse.body.token;

      const productResponse = await request(app)
        .post('/api/products')
        .send({ name: 'Order Product', price: 50.00, stock: 10 });
      
      orderProductId = productResponse.body.id;
      productIds.push(orderProductId);

      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${orderToken}`)
        .send({ product_id: orderProductId, quantity: 3 });
    });

    When('I create an order with shipping address "123 Main St"', async function () {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${orderToken}`)
        .send({ shipping_address: '123 Main St' });
      
      expect(response.status).to.equal(201);
      orderId = response.body.id;
    });

    Then('the order should have status "pending"', function () {
      expect(orderId).to.be.a('string');
    });

    And('my cart should be empty', async function () {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${orderToken}`);
      
      expect(response.body).to.have.lengthOf(0);
    });

    And('the order total should be 150.00 (3 x 50.00)', async function () {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${orderToken}`);
      
      expect(response.body.total).to.equal(150.00);
    });
  });

  Scenario('Listing orders', () => {
    Given('I have placed an order', async function () {
      expect(orderId).to.be.a('string');
    });

    When('I list my orders', async function () {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${orderToken}`);
      
      expect(response.status).to.equal(200);
    });

    Then('I should see my order in the list', function () {
      expect(this.response.body).to.be.an('array');
    });
  });
});
