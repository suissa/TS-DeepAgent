import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../models/types';
import { CartRepository } from '../repositories/cartRepository';
import { ProductRepository } from '../repositories/productRepository';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  addToCart(customerId: string, productId: string, quantity: number = 1): CartItem {
    const product = this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const existingItem = this.cartRepository.findByCustomerAndProduct(customerId, productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error('Quantity exceeds available stock');
      }
      return this.cartRepository.updateQuantity(existingItem.id, newQuantity)!;
    }

    const cartItem: CartItem = {
      id: uuidv4(),
      customer_id: customerId,
      product_id: productId,
      quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.cartRepository.addItem(cartItem);
  }

  getCart(customerId: string): CartItem[] {
    return this.cartRepository.findByCustomerId(customerId);
  }

  updateQuantity(customerId: string, productId: string, quantity: number): CartItem | null {
    const product = this.productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (quantity > product.stock) {
      throw new Error('Quantity exceeds available stock');
    }

    if (quantity <= 0) {
      this.cartRepository.removeByProduct(customerId, productId);
      return null;
    }

    return this.cartRepository.updateQuantityByProduct(customerId, productId, quantity);
  }

  removeFromCart(customerId: string, productId: string): boolean {
    return this.cartRepository.removeByProduct(customerId, productId);
  }

  clearCart(customerId: string): boolean {
    return this.cartRepository.clearCart(customerId);
  }

  getCartTotal(customerId: string): { items: CartItem[]; total: number } {
    const items = this.cartRepository.findByCustomerId(customerId);
    let total = 0;

    for (const item of items) {
      const product = this.productRepository.findById(item.product_id);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    return { items, total };
  }
}
