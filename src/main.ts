import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmetImport from 'helmet';
import type { INestApplication } from '@nestjs/common';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

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
  // Serve Swagger UI assets from this deployment (no external CDN).
  // Each require.resolve uses a literal path so Vercel includes the files in the function.
  const nodeRequire = createRequire(import.meta.url);
  const swaggerAssets: Record<string, { file: string; type: string }> = {
    'swagger-ui.css': { file: nodeRequire.resolve('swagger-ui-dist/swagger-ui.css'), type: 'text/css' },
    'swagger-ui-bundle.js': { file: nodeRequire.resolve('swagger-ui-dist/swagger-ui-bundle.js'), type: 'application/javascript' },
    'swagger-ui-standalone-preset.js': { file: nodeRequire.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js'), type: 'application/javascript' },
  };
  const adapter = app.getHttpAdapter();
  for (const [name, asset] of Object.entries(swaggerAssets)) {
    adapter.get(`/swagger-assets/${name}`, (_req: any, res: any) => {
      res.setHeader('Content-Type', asset.type);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.end(readFileSync(asset.file));
    });
  }
  SwaggerModule.setup('swagger', app, documentation, {
    customCssUrl: '/swagger-assets/swagger-ui.css',
    customJs: ['/swagger-assets/swagger-ui-bundle.js', '/swagger-assets/swagger-ui-standalone-preset.js'],
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
