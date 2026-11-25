import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmetImport from 'helmet';
import type { INestApplication } from '@nestjs/common';
import { gunzipSync } from 'zlib';
import { swaggerAssets } from './swagger-assets.js';

// helmet is a CJS module: some toolchains (e.g. Vercel's builder without
// esModuleInterop) expose it as a namespace instead of a callable default.
const helmet: any = (helmetImport as any).default ?? helmetImport;

let appPromise: Promise<INestApplication> | undefined;

async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

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
  // Serve Swagger UI assets from this app (embedded in the bundle), no external CDN.
  const adapter = app.getHttpAdapter();
  const decoded: Record<string, Buffer> = {};
  for (const [name, asset] of Object.entries(swaggerAssets)) {
    adapter.get(`/swagger-assets/${name}`, (_req: any, res: any) => {
      decoded[name] ??= gunzipSync(Buffer.from(asset.data, 'base64'));
      res.setHeader('Content-Type', `${asset.type}; charset=utf-8`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.end(decoded[name]);
    });
  }
  SwaggerModule.setup('swagger', app, documentation, {
    customCssUrl: '/swagger-assets/swagger-ui.css',
    customJs: ['/swagger-assets/swagger-ui-bundle.js', '/swagger-assets/swagger-ui-standalone-preset.js'],
  });

  await app.init();
  return app;
}

function bootstrap(): Promise<INestApplication> {
  if (!appPromise) {
    appPromise = createApp().catch((err) => {
      appPromise = undefined;
      throw err;
    });
  }
  return appPromise;
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
