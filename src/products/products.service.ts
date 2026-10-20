type ProductType = { id: number; title: string; price: number };
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';

@Injectable()
export class ProductsService {
  private products: ProductType[] = [
    { id: 1, title: 'book', price: 10 },
    { id: 2, title: 'book', price: 100 },
    { id: 3, title: 'book', price: 105 },
    { id: 4, title: 'book', price: 101 },
  ];


  /**
   * Create Product
   */
  CreateProduct({ title, price }: CreateProductDto) {
    const newProduct: ProductType = {
      id: this.products.length + 1,
      title,
      price
    };
    this.products.push(newProduct);
    return newProduct;
  }

  /**
  * get All Products
  */
  getAll() {
    return this.products;
  }

  /**
 * Get One By Id
 */
  getOneBy(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  /**
 * Update Product
 */
  Update(id: number, updateProductDto: UpdateProductDto,) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');

    console.log(updateProductDto);
    return { message: 'product updated successfully' };
  }

  /**
  * Delete Product
  */
  Delete(id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');

    this.products = this.products.filter((p) => p.id !== id);
    return { message: 'product deleted' };
  }


}