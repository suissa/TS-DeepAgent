import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { AddToCartSchema } from '../models/types';

const cartService = new CartService();

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const cart = cartService.getCart(customerId);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const validated = AddToCartSchema.parse(req.body);
      const item = cartService.addToCart(customerId, validated.product_id, validated.quantity);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const quantity = parseInt(req.body.quantity);
      const item = cartService.updateQuantity(customerId, req.params.productId, quantity);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      const removed = cartService.removeFromCart(customerId, req.params.productId);
      if (!removed) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customerId;
      cartService.clearCart(customerId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
