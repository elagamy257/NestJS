import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JWTPayloadType } from "../../utils/type.js";
import { CURRENT_USER_KEY } from "../../utils/constans.js";

// CurrentUser paameter Decorator
export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const payload: JWTPayloadType = request[CURRENT_USER_KEY]
    return payload;
  }
)