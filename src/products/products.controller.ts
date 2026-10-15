import { Controller, Get, Post,Delete, Body, Param, NotFoundException, Put} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';
type ProductType = { id: number; title: string; price: number };
@Controller("api/products")
export class ProductsControllers {
  private products: ProductType[] = [
    { id: 1, title: 'book', price: 10 },
    { id: 2, title: 'book', price: 100 },
    { id: 3, title: 'book', price: 105 },
    { id: 4, title: 'book', price: 101 },
  ];

  // POST:  ~/api/products
  @Post()
  CreateNewProduct(@Body() body: CreateProductDto) {
    const newProduct: ProductType = {
      id: this.products.length + 1,
      title: body.title,
      price: body.price,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  // GET:  ~/api/products
  @Get()
  getAllProducts() {
    return this.products;
  }

  // GET:  ~/api/products/:id
  @Get(':id')
  getSingleProducts(@Param('id') id: string) {
    const product = this.products.find(p=> p.id === parseInt(id));
    if(!product) throw new NotFoundException("Product not found")
    return product;
  }
  // PUT:  ~/api/products/:id
  @Put(':id')
  UpdateProduct(@Param('id') id: string, @Body() body:UpdateProductDto ) {
    const product = this.products.find(p=> p.id === parseInt(id));
    if(!product) throw new NotFoundException("Product not found")
    return {message: 'product updated successfully'};
  }
  
  // Delete:  ~/api/products/:id
  @Delete(':id')
  DeleteProduct(@Param('id') id: string ) {
    const product = this.products.find(p=> p.id === parseInt(id));
    if(!product) throw new NotFoundException("Product not found")
    return {message: 'product deleted'};
  }


}
