import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customerService';
import { CreateCustomerSchema, LoginSchema } from '../models/types';

const customerService = new CustomerService();

export class CustomerController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = CreateCustomerSchema.parse(req.body);
      const customer = customerService.registerCustomer(validated);
      res.status(201).json(customer);
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        res.status(409).json({ error: 'Email already exists' });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = LoginSchema.parse(req.body);
      const result = customerService.authenticate(validated.email, validated.password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = customerService.getCustomer(req.params.id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
