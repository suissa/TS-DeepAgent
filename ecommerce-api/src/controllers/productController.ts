import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { CreateProductSchema, UpdateProductSchema } from '../models/types';

const productService = new ProductService();

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateProductSchema.parse(req.body);
      const product = productService.createProduct(validated);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = productService.getProduct(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        category: req.query.category as string,
        min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
      };

      const result = productService.listProducts(filters, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = UpdateProductSchema.parse(req.body);
      const product = productService.updateProduct(req.params.id, validated);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = productService.deleteProduct(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
