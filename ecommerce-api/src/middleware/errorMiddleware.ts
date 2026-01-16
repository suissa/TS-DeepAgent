import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  if (err.name === 'ZodError') {
    res.status(400).json({ error: 'Validation error', details: err.message });
    return;
  }

  if (err.message === 'Product not found' || 
      err.message === 'Customer not found' || 
      err.message === 'Order not found') {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message === 'Invalid credentials' ||
      err.message === 'Email already exists') {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.message === 'Price must be positive' ||
      err.message === 'Stock cannot be negative' ||
      err.message === 'Invalid email format' ||
      err.message === 'Password must be at least 6 characters' ||
      err.message === 'Insufficient stock' ||
      err.message === 'Product not found' ||
      err.message === 'Cart is empty' ||
      err.message === 'Quantity exceeds available stock' ||
      err.message === 'Can only cancel pending orders') {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
