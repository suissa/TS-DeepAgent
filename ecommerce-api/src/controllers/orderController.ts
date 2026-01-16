import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { OrderStatusSchema } from '../models/types';

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const { shipping_address } = req.body;
      const order = orderService.createOrder(customerId, shipping_address);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const order = orderService.getOrder(req.params.id, customerId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const orders = orderService.listCustomerOrders(customerId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const validated = OrderStatusSchema.parse(req.body.status);
      const order = orderService.updateOrderStatus(req.params.id, validated, customerId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const order = orderService.cancelOrder(req.params.id, customerId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json(order);
    } catch (error: any) {
      if (error.message === 'Can only cancel pending orders') {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

export const orderController = new OrderController();
