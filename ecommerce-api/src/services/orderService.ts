import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, OrderWithItems } from '../models/types';
import { OrderRepository, OrderItemRepository } from '../repositories/orderRepository';
import { CartRepository } from '../repositories/cartRepository';
import { ProductRepository } from '../repositories/productRepository';

export class OrderService {
  private orderRepository: OrderRepository;
  private orderItemRepository: OrderItemRepository;
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  createOrder(customerId: string, shippingAddress?: string): OrderWithItems {
    const cartItems = this.cartRepository.findByCustomerId(customerId);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cartItems) {
      const product = this.productRepository.findById(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      total += product.price * item.quantity;

      const orderItem: OrderItem = {
        id: uuidv4(),
        order_id: '',
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        created_at: new Date().toISOString(),
      };
      orderItems.push(orderItem);
    }

    const order: Order = {
      id: uuidv4(),
      customer_id: customerId,
      status: 'pending',
      total,
      shipping_address: shippingAddress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.orderRepository.create(order);

    for (const item of orderItems) {
      item.order_id = order.id;
      this.orderItemRepository.create(item);
    }

    this.cartRepository.clearCart(customerId);

    return {
      ...order,
      items: orderItems,
    };
  }

  getOrder(orderId: string, customerId: string): OrderWithItems | null {
    const order = this.orderRepository.findById(orderId);
    if (!order) return null;

    if (order.customer_id !== customerId) {
      return null;
    }

    const items = this.orderItemRepository.findByOrderId(orderId);

    return {
      ...order,
      items,
    };
  }

  listCustomerOrders(customerId: string): OrderWithItems[] {
    const orders = this.orderRepository.findByCustomerId(customerId);

    return orders.map(order => ({
      ...order,
      items: this.orderItemRepository.findByOrderId(order.id),
    }));
  }

  updateOrderStatus(orderId: string, status: OrderStatus, customerId: string): Order | null {
    const order = this.orderRepository.findById(orderId);
    if (!order || order.customer_id !== customerId) {
      return null;
    }

    return this.orderRepository.updateStatus(orderId, status);
  }

  cancelOrder(orderId: string, customerId: string): Order | null {
    const order = this.orderRepository.findById(orderId);
    if (!order) return null;

    if (order.customer_id !== customerId) {
      return null;
    }

    if (order.status !== 'pending') {
      throw new Error('Can only cancel pending orders');
    }

    return this.orderRepository.updateStatus(orderId, 'cancelled');
  }
}
