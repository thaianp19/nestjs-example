import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { auth } from './middlewares/auth.middleware';
import { ProductsController } from './products/products.controller';
import { UserController } from './user/user.controller';
import { User } from './user/entities/user.entity';
import { Product } from './products/entities/product.entity';

@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(auth)
      .exclude(
        { path: 'user/sign-up', method: RequestMethod.POST },
        {
          path: 'user/sign-in',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(ProductsController, UserController);
  }
}

