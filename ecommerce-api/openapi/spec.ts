export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API',
    version: '1.0.0',
    description: 'A RESTful API for e-commerce operations with Products, Customers, Orders, and Cart',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' },
  ],
  tags: [
    { name: 'Products', description: 'Product management endpoints' },
    { name: 'Customers', description: 'Customer management endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Cart', description: 'Shopping cart endpoints' },
  ],
  paths: {
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List all products',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'min_price', in: 'query', schema: { type: 'number' } },
          { name: 'max_price', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'List of products', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProduct' } } } },
        responses: {
          '201': { description: 'Product created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Product found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '404': { description: 'Product not found' },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProduct' } } } },
        responses: {
          '200': { description: 'Product updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
          '404': { description: 'Product not found' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Product deleted' },
          '404': { description: 'Product not found' },
        },
      },
    },
    '/api/customers': {
      post: {
        tags: ['Customers'],
        summary: 'Register a new customer',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCustomer' } } } },
        responses: {
          '201': { description: 'Customer created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } },
          '400': { description: 'Invalid input' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/customers/login': {
      post: {
        tags: ['Customers'],
        summary: 'Customer login',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, customer: { $ref: '#/components/schemas/Customer' } } } } } },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List customer orders',
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
        responses: {
          '200': { description: 'List of orders', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create a new order from cart',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { shipping_address: { type: 'string' } } } } } },
        responses: {
          '201': { description: 'Order created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Order found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get cart items',
        responses: {
          '200': { description: 'Cart items', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } } } } },
        },
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddToCart' } } } },
        responses: {
          '201': { description: 'Item added to cart' },
          '400': { description: 'Invalid request' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart',
        responses: { '204': { description: 'Cart cleared' } },
      },
    },
    '/api/cart/{productId}': {
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Item removed' } },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          category: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateProduct: {
        type: 'object',
        required: ['name', 'price', 'stock'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          category: { type: 'string' },
        },
      },
      UpdateProduct: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          category: { type: 'string' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateCustomer: {
        type: 'object',
        required: ['email', 'name', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          password: { type: 'string', minLength: 6 },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customer_id: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
          total: { type: 'number' },
          shipping_address: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customer_id: { type: 'string', format: 'uuid' },
          product_id: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      AddToCart: {
        type: 'object',
        required: ['product_id'],
        properties: {
          product_id: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', default: 1 },
        },
      },
    },
  },
};

export default openApiSpec;
