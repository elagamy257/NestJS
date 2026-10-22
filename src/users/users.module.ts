import { Module } from "@nestjs/common";
import { UsersControllers } from "./products.controller.js";
import { UsersService } from "./users.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";

@Module({
  controllers: [UsersControllers],
  providers: [UsersService],
  imports: [ TypeOrmModule.forFeature([User])]
})
export class UsersModules { }