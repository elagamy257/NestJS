 import { Controller, Get } from "@nestjs/common";
import { title } from "process";

@Controller ({})
export class ProductsControllers{

  // GET:  ~/api/products
  @Get("/api/products")
  getAllProducts(){
    return [
      { id:1, title: 'book', price: 10},
      { id:2, title: 'book', price: 100},
      { id:3, title: 'book', price: 105},
      { id:4, title: 'book', price: 101},
    ]
  }
}