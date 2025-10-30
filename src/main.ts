import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './logger/logger.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable trust proxy for accurate IP detection (Express specific)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Automatically transform payloads to DTO instances
  }));
  
  // Get the HTTP adapter and logger service for the exception filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  const loggerService = app.get(LoggerService);
  
  // Register global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService));
  
  // Use custom logger
  app.useLogger(loggerService);

  // swagger
    // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Event Management System API')
    .setDescription('API documentation for Managing Events')
    .setVersion('1.0')
    .addBearerAuth()                             // Add Bearer token authentication
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: '/docs-json',
    swaggerOptions: {
    persistAuthorization: true,                 // Remember auth token
    tagsSorter: 'alpha',                       // Sort tags alphabetically
    operationsSorter: 'alpha',                 // Sort operations alphabetically
  },
  });

  
  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
