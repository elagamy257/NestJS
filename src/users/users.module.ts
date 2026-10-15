import { Module } from "@nestjs/common";
import { UsersControllers } from "./products.controller.js";

@Module ({
  controllers: [UsersControllers]
})
export class UsersModules{}