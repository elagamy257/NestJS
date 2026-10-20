import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';
import { ProductsService } from './products.service.js';

@Controller('api/products')
export class ProductsControllers {
  constructor(private readonly productsService: ProductsService) { }

  // POST:  ~/api/products
  @Post()
  CreateNewProduct(@Body() body: CreateProductDto) {
    return this.productsService.CreateProduct(body);
  }

  // GET:  ~/api/products
  @Get()
  getAllProducts() {
    return this.productsService.getAll();
  }

  // GET:  ~/api/products/:id
  @Get(':id')
  getSingleProducts(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getOneBy(id);
  }
  // PUT:  ~/api/products/:id
  @Put(':id')
  UpdateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto,) {
    return this.productsService.Update(id, body);
  }

  // Delete:  ~/api/products/:id
  @Delete(':id')
  DeleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.Delete(id);
  }
}
