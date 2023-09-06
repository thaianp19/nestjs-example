
## Installation
`npm i -g @nestjs/cli`
`nest new [project-name]`
Basic structure of the project: 
![[Pasted image 20230906095849.png]]
* `app.controller.ts`: Basic controller with a single route
* `app.controller.spec.ts`: The unit tests for the controller
* `app.module.ts`: The root module of the application
* `app.service.ts`: Basic service with a single method
* `main.ts`: The entry file for the application which users the core function `NestFactory` to create a Nest application instance
## Usage 
* Run
	`npm run start`
	This command will automatically run on port 3000. You can change the port at the line `await app.listen(3000)` in `main.ts` file.
	You can check to make sure the all your routes are mapped and worked in the terminal: ![[Pasted image 20230906100955.png]]
---
## Overview


### Platform
Nest aim to be a [platform-agnostic](https://www.techtarget.com/whatis/definition/agnostic#:~:text=Platform%2Dagnostic%20software%20runs%20on,on%20Windows%2C%20macOS%20and%20Linux.) framework, makes it possible to create and take advantage of across several different types of application.
We can choose which platform to use by its own interface: `NestExpressApplication` and `NestFastifyApplication`, then pass the type to the `NestFactory.create()` method: `NestFactory.create<NestExpressApplication>(AppModule)`.

| `platform-express` | **[Express](https://expressjs.com/)** is well-knows web framework for node. The `@nestjs/platform-express` package is used by default. |
| --------------  | ---------------------------------------------------------------------------------- |
| `platform-fastify` | [Fastify](https://fastify.dev/) is a high performance and low overhead framework highly focused on providing maximum efficiency and speed |

----
### Module
A module is a class annotated with a `@Module()` decorator. Each application has at least one module, a **root module** - presented by `app.module.ts`. Every module must be import into root module in order to work. 
![[Pasted image 20230906143234.png]]
The `@Module()` decorator takes a single object with these properties:

| `provider` | the providers that will be instantiated by the Nest injector and that may be shared at least across this module |
| ---- | ---- | 
| `controllers` |  the set of controllers defined in this module which have to be instantiated |
| `imports` |  the list of imported modules that export the providers which are required in this module |
| `exports` | the subset of `providers` that are provided by this module and should be available in other modules which import this module. You can use either the provider itself or just its token (`provide` value) |

----
#### Controller
Controller is a class that responsible for handling incoming **requests** and returning **responses** to the client.
In order to create a basic controller, we use `@Controller()` **decorator**.
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  @Get()
  findAll() : string {
    return 'This action return all products';
  }
}
```
The `@Get()` HTTP request method decorator before the `findAll()` tell Nest to create a handler for the `GET /products`
The route path of the request is determined by concatenating the (optional) prefix declared for the controller: `products`

Plus, we can access to the `request` object by user adding the `@Req()` decorator:
```typescript
@Get()
  findAll(@Req() request: Request) : string {
    return 'This action return all products';
  }
```
The `Request` type will be automatically imported from the [underlying platform](#Platform) of Nest (Express by default)
We'll typically want more endpoint for order HTTP request:
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('products')
export class ProductsController {

  @Post()
  create() {
    return 'This action creates new product';
  }

  @Get()
  findAll() {
    return 'This action returns all products';
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action finds product has id: ${id}`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes product has id: ${id}`;
  }
  
}
```
----
### Provider
Providers are a fundamental concept in Nest. Many of the basic Nest classes may be treated as a provider – services, repositories, factories, helpers, and so on. The main idea of a provider is that it can be injected as a **dependency**; this means objects can create various relationships with each other.
#### Service
Define Product service
```typescript
import { Injectable } from '@nestjs/common';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];

  create(product: Product) {
    return this.products.push(product);
  }

  findAll() {
    return this.products;
  }

  findOne(id: string) {
    return this.products.find((product: Product) => product.id == id);
  }
}
```

and interface Product
```typescript
export interface Product {
      id: string;
      title: string;
}
```
And of course, we have to define Provider (`ProductsService`) and the consumer for that service (`ProductsController`) by editing Product module file (`product.module.ts`). 
The last thing we need to do is import this Product module into the root module (the `AppModule`, defined in the `app.module.ts` file).
src
│   app.controller.spec.ts
│   app.controller.ts
│   app.module.ts
│   app.service.ts
│   main.ts
│
└───products
    │   products.controller.spec.ts
    │   products.controller.ts
    │   products.module.ts
    │   products.service.spec.ts
    │   products.service.ts
    │
    ├───dto
    │       create-product.dto.ts
    │       update-product.dto.ts
    │
    └───interfaces
            product.interface.ts
            
----
### Middleware
We can define a middleware
```typescript
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};
```
and use it in Module level. In this case, we use `AppModule`
```typescript 
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { logger } from './middlewares/logger.middleware';

@Module({
  imports: [ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes('products');
  }
}
```
The `MiddlewareConsumer` is a helper class. It provides several built-in methods to manage middleware.
The `forRoutes()` method can take a single string, multiple strings, a `RouteInfo` object, a controller and even multiple controller classes. Plus, we can pass our `ProductsController` to it: 
```typescript
consumer.apply(logger).forRoutes(ProductsController);
```
**Excluding routes**
At times we want to **exclude** certain routes from having the middleware applied. We can easily exclude certain routes with the `exclude()` method. This method can take a single string, multiple strings, or a `RouteInfo` object identifying routes to be excluded:
```typescript
consumer
  .apply(logger)
  .exclude(
    { path: 'products', method: RequestMethod.GET },
    { path: 'products', method: RequestMethod.POST },
    'products/(.*)',
  )
  .forRoutes(ProductsController);
```
Middleware can be used globally in `main.ts`:
```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

----
### Exception filters
Nest provides a built-in `HttpException` class to send standard HTTP response objects when certain error condition occur.
For example, let's throw an exception in `ProductsController`: 
```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```
When the client calls this endpoint, the response looks like this:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

The `HttpException` constructor takes two required arguments which determine the response:

- The `response` argument defines the JSON response body. It can be a `string` or an `object` as described below.
- The `status` argument defines the [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

By default, the JSON response body contains two properties:
- `statusCode`: defaults to the HTTP status code provided in the `status` argument
- `message`: a short description of the HTTP error based on the `status`
To override just the message portion of the JSON response body, supply a string in the `response` argument. To override the entire JSON response body, pass an object in the `response` argument. Nest will serialize the object and return it as the JSON response body.
The second constructor argument - `status` - should be a valid HTTP status code. Best practice is to use the `HttpStatus` enum imported from `@nestjs/common`.
There is a **third** constructor argument (optional) - `options` - that can be used to provide an error [cause](https://nodejs.org/en/blog/release/v16.9.0/#error-cause). This `cause` object is not serialized into the response object, but it can be useful for logging purposes, providing valuable information about the inner error that caused the `HttpException` to be thrown.
Here's an example overriding the entire response body and providing an error cause

```typescript

@Get()
async findAll() {
  try {
    await this.productsService.findAll()
  } catch (error) { 
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}
```
And this is how the response would look:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```
 If you do need to create customized exceptions, create your own **exceptions hierarchy**, where your custom exceptions inherit from the base `HttpException` class. With this approach, Nest will recognize your exceptions, and automatically take care of the error responses. Let's implement a custom exception:

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

Since `ForbiddenException` extends the base `HttpException`, it will work seamlessly with the built-in exception handler, and therefore we can use it inside the `findAll()` method.
```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}
```
Plus, Nest also provides a set of standard exceptions the inherit from the base `HttpException`, here is a list of built-in:
- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`
----
### Guards
A guard is a class annotated with the `@Injectable()` decorator, which implements the `CanActivate` interface
Guards have a single responsibility. They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc) present at run-time.

----
### TypeORM Integration
Nest provides the `@nestjs/typeorm` package
To begin using it, you'll simply need to install the associated client API libraries for your selected database.

```bash
$ npm install --save @nestjs/typeorm typeorm mysql2
```

-----
### Further help
[Dependency Injection](https://angular.io/guide/dependency-injection) article of Angular - recommended by NestJS
