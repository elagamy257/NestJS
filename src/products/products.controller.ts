import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateProductDto } from './dtos/create-products.dto.js';
import { UpdateProductDto } from './dtos/update-products.dto.js';

type ProductType = { id: number; title: string; price: number };
@Controller('api/products')
export class ProductsControllers {
  private products: ProductType[] = [
    { id: 1, title: 'book', price: 10 },
    { id: 2, title: 'book', price: 100 },
    { id: 3, title: 'book', price: 105 },
    { id: 4, title: 'book', price: 101 },
  ];

  // POST:  ~/api/products/expess-way
  // @Post('expess-way')
  // CreateNewProductExpressWay(
  //   @Req() req: Request,
  //   @Res({ passthrough: true }) res: Response,
  //   @Headers() Header: any,
  // ) {
  //   const newProduct: ProductType = {
  //     id: this.products.length + 1,
  //     title: req.body.title,
  //     price: req.body.price,
  //   };
  //   this.products.push(newProduct);
  //   console.log(Headers);
  //   res.status(201).json(newProduct);

  //   res.cookie('authCookie', 'this ia a cookie', {
  //     httpOnly: true,
  //     maxAge: 120,
  //   });
  // }

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
  getSingleProducts(@Param('id', ParseIntPipe) id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
  // PUT:  ~/api/products/:id
  @Put(':id')
  UpdateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');

    if (body.title !== undefined) product.title = body.title;
    if (body.price !== undefined) product.price = body.price;

    return { message: 'product updated successfully' };
  }

  // Delete:  ~/api/products/:id
  @Delete(':id')
  DeleteProduct(@Param('id', ParseIntPipe) id: number) {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');

    this.products = this.products.filter((p) => p.id !== id);
    return { message: 'product deleted' };
  }
}
