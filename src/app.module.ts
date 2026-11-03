import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ProductsModules } from './products/products.module';
import { ReviewsModules } from './reviews/reviews.module';
import { UsersModules } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Review } from './reviews/review.entity';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { LoggerMiddlrware } from './utils/middleware/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { AppController } from './app.controller';
import { dataSourceOptions } from './db/data-source';
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production'? `.env.${process.env.NODE_ENV || 'development'}`: ".env"
    }),
    ProductsModules,
    ReviewsModules,
    UsersModules,
    UploadsModule,
    MailModule,
    TypeOrmModule.forRoot(dataSourceOptions),
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
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
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

// local db

// {
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => {
//         return {
//           type: 'postgres',
//           database: config.get<string>("DB_DATABASE"),
//           username: config.get<string>("DB_USERNAME"),
//           password: config.get<string>("DB_PASSWORD")?.toString() ?? '',
//           port: config.get<number>("DB_PORT"),
//           host: 'localhost',
//           synchronize: process.env.NODE_ENV !== 'production',
//           entities: [Product, User, Review]
//         }
//       }

//     }
