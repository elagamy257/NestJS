import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  // Apply Middleware
  app.use(helmet())

  // Cors policy
  app.enableCors({
    origin: "http://localhost:3000"
  })

  //Swagger
  const swagger = new DocumentBuilder()
  .setTitle("Nest JS - App Api")
  .setDescription("Your Api description")
  .addServer("http://localhost:5000")
  .setTermsOfService("http://localhost:5000/terms")
  .setVersion("1.0")
  .addSecurity('bearer', {type: 'http', scheme: 'bearer'})
  .addBearerAuth()
  .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  // http://localhost:5000/swagger
  SwaggerModule.setup("swagger", app, documentation);

  // running the app
  await app.listen(process.env.PORT ?? 5000);
}
await bootstrap();
