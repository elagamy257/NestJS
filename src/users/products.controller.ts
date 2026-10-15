 import { Controller, Get } from "@nestjs/common";
import { title } from "process";

@Controller ({})
export class UsersControllers{

  // GET:  ~/api/users
  @Get("/api/users")
  getAllUsers(){
    return [
      { id:1, email: 'aya@gmail.com'},
      { id:2, email: 'aya@gmail.com'},
      { id:3, email: 'aya@gmail.com'},
      { id:4, email: 'aya@gmail.com'},
    ]
  }
}