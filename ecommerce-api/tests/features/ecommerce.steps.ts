import { Given, When, Then, Before, After } from '@cucumber/cucumber';
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
let productId: string;
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

Given('the database is initialized', function () {
  expect(app).to.not.be.undefined;
});

When('I create a product with name {string}, price {float}, and stock {int}', async function (name: string, price: number, stock: number) {
  const response = await request(app)
    .post('/api/products')
    .send({ name, price, stock, description: 'Test product' });
  
  expect(response.status).to.equal(201);
  productId = response.body.id;
});

Then('the product should be created successfully', async function () {
  const response = await request(app)
    .get(`/api/products/${productId}`);
  
  expect(response.status).to.equal(200);
  expect(response.body.name).to.equal('Test Product');
});

When('I list all products', async function () {
  this.response = await request(app)
    .get('/api/products');
});

Then('I should see the new product in the list', async function () {
  expect(this.response.status).to.equal(200);
  expect(this.response.body).to.be.an('array');
  expect(this.response.body.length).to.be.greaterThan(0);
});

When('I register a customer with email {string} and name {string}', async function (email: string, name: string) {
  const response = await request(app)
    .post('/api/customers')
    .send({ email, name, password: 'password123' });
  
  expect(response.status).to.equal(201);
  customerId = response.body.id;
});

Then('the customer should be registered successfully', function () {
  expect(customerId).to.be.a('string');
});

When('I login with email {string} and password {string}', async function (email: string, password: string) {
  const response = await request(app)
    .post('/api/customers/login')
    .send({ email, password });
  
  expect(response.status).to.equal(200);
  authToken = response.body.token;
});

Then('I should receive an authentication token', function () {
  expect(authToken).to.be.a('string');
});

When('I add the product to my cart with quantity {int}', async function (quantity: number) {
  const response = await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ product_id: productId, quantity });
  
  expect(response.status).to.equal(201);
});

Then('the item should be in my cart', async function () {
  const response = await request(app)
    .get('/api/cart')
    .set('Authorization', `Bearer ${authToken}`);
  
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.equal(1);
});

When('I create an order with shipping address {string}', async function (address: string) {
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ shipping_address: address });
  
  expect(response.status).to.equal(201);
  orderId = response.body.id;
});

Then('the order should be created with status {string}', async function (status: string) {
  expect(orderId).to.be.a('string');
  
  const response = await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Authorization', `Bearer ${authToken}`);
  
  expect(response.status).to.equal(200);
  expect(response.body.status).to.equal(status);
});

When('I update the product price to {float}', async function (newPrice: number) {
  const response = await request(app)
    .put(`/api/products/${productId}`)
    .send({ price: newPrice });
  
  expect(response.status).to.equal(200);
});

Then('the product price should be updated', async function () {
  const response = await request(app)
    .get(`/api/products/${productId}`);
  
  expect(response.status).to.equal(200);
  expect(response.body.price).to.equal(199.99);
});

When('I delete the product', async function () {
  const response = await request(app)
    .delete(`/api/products/${productId}`);
  
  expect(response.status).to.equal(204);
});

Then('the product should no longer exist', async function () {
  const response = await request(app)
    .get(`/api/products/${productId}`);
  
  expect(response.status).to.equal(404);
});
