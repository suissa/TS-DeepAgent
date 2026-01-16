import { z } from 'zod';

const integer = (): z.ZodNumber => z.number().int();

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: integer().nonnegative(),
  category: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: integer().nonnegative(),
  category: z.string().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password_hash: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  status: OrderStatusSchema,
  total: z.number().nonnegative(),
  shipping_address: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: integer().positive(),
  unit_price: z.number().positive(),
  created_at: z.string().datetime(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: integer().positive(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AddToCartSchema = z.object({
  product_id: z.string().uuid(),
  quantity: integer().positive().default(1),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: Customer;
}

export interface ProductWithDetails extends Product {
  in_stock: boolean;
}
