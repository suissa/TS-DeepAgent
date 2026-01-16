import { v4 as uuidv4 } from 'uuid';
import { Product, CreateProductInput, UpdateProductInput } from '../models/types';
import { ProductRepository } from '../repositories/productRepository';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  createProduct(input: CreateProductInput): Product {
    if (input.price <= 0) {
      throw new Error('Price must be positive');
    }
    if (input.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    const product: Product = {
      id: uuidv4(),
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      category: input.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.repository.create(product);
  }

  getProduct(id: string): Product | null {
    return this.repository.findById(id);
  }

  listProducts(
    filters?: { category?: string; min_price?: number; max_price?: number },
    page: number = 1,
    limit: number = 10
  ): { products: Product[]; total: number; page: number; totalPages: number } {
    return this.repository.findAllPaginated(filters, page, limit);
  }

  updateProduct(id: string, input: UpdateProductInput): Product | null {
    if (input.price !== undefined && input.price <= 0) {
      throw new Error('Price must be positive');
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    return this.repository.update(id, input);
  }

  deleteProduct(id: string): boolean {
    return this.repository.delete(id);
  }

  getProductWithDetails(id: string): Product | null {
    const product = this.repository.findById(id);
    if (!product) return null;

    return product;
  }
}
