import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductsModules } from './products/products.module.js';
import { ReviewsModules } from './reviews/reviews.module.js';
import { UsersModules } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity.js';
import { Review } from './reviews/review.entity.js';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module.js';
import { MailModule } from './mail/mail.module.js';
import { LoggerMiddlrware } from './utils/middleware/logger.middleware.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
@Module({
  imports: [
    ProductsModules,
    ReviewsModules,
    UsersModules,
    UploadsModule,
    MailModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD")?.toString() ?? '',
          port: config.get<number>("DB_PORT"),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'production',
          entities: [Product, User, Review]
        }
      }

    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000, //10 sec
        limit: 3 // 3 req every 10 sec for a client
      }
    ])
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],

  // exports: [],
  // controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddlrware)
      .forRoutes({
        path: 'api/products',
        method: RequestMethod.GET
      })
    
      // consumer
      //  .apply(helmet())
      //  .forRoutes({ 
      //     path: 'api/users',
      //     method: RequestMethod.ALL
      //   })
  }

}
