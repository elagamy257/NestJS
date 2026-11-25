import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmetImport from 'helmet';
import type { INestApplication } from '@nestjs/common';

// helmet is a CJS module: some toolchains (e.g. Vercel's builder without
// esModuleInterop) expose it as a namespace instead of a callable default.
const helmet: any = (helmetImport as any).default ?? helmetImport;

let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (app) return app;

  app = await NestFactory.create(AppModule);

  // Apply Middleware
  app.use(helmet());

  // Cors policy — allow CLIENT_DOMAIN in prod, or all origins as fallback
  const allowedOrigin = process.env.CLIENT_DOMAIN ?? '*';
  app.enableCors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Swagger
  const swagger = new DocumentBuilder()
    .setTitle('Nest JS - App Api')
    .setDescription('Your Api description')
    .setVersion('1.0')
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  const cdn = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';
  SwaggerModule.setup('swagger', app, documentation, {
    customCssUrl: `${cdn}/swagger-ui.css`,
    customJs: [`${cdn}/swagger-ui-bundle.js`, `${cdn}/swagger-ui-standalone-preset.js`],
  });

  await app.init();
  return app;
}

// Vercel serverless handler — entry point for Vercel
export default async function handler(req: any, res: any) {
  const application = await bootstrap();
  const httpAdapter = application.getHttpAdapter();
  const instance = httpAdapter.getInstance() as (req: any, res: any) => void;
  instance(req, res);
}

// Local / traditional server startup (skipped on Vercel)
if (process.env.VERCEL !== '1') {
  bootstrap()
    .then((application) => application.listen(process.env.PORT ?? 5000))
    .catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
}
