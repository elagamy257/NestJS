import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    console.log("Before Route Handler");

    return next.handle().pipe(map((dataFromRouteHandler) => {
      if (dataFromRouteHandler && typeof dataFromRouteHandler === 'object') {
        const { password: _password, ...otherData } = dataFromRouteHandler;
        return { ...otherData };
      }
      return dataFromRouteHandler;
    }));
  }
}
