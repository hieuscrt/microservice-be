import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  KAFKA_HOST: str({ default: 'localhost' }),
  KAFKA_PORT: port({ default: 29092 }),
  KAFKA_CONSUMER_GROUP: str({ default: 'api-gateway-consumer' }),
});