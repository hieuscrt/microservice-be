import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { env } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [`${env.KAFKA_HOST}:${env.KAFKA_PORT}`],
      },
      consumer: {
        groupId: env.KAFKA_CONSUMER_GROUP,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();