import { SetMetadata } from "@nestjs/common";
import { UserType } from "../../utils/enums.js";

//Roles Method Decorator
export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);