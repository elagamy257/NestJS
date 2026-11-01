import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddlrware implements NestMiddleware{

  use(req: Request, res: Response, next: NextFunction) {
    // console.log({
    //   headers: req.headers,
    //   method: req.method,
    //   hostname: req.hostname
    // });

    next();
  }
}