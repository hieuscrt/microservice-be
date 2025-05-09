import { Controller, Post, Body, Logger, HttpException, HttpStatus, Inject, Headers } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('auth.register');
    this.authClient.subscribeToResponseOf('auth.login');
    this.authClient.subscribeToResponseOf('auth.refresh');
    this.authClient.subscribeToResponseOf('auth.edit');
    await this.authClient.connect();
  }

  @Post('register')
  async register(@Body() data: { email: string; password: string }) {
    this.logger.log('Sending to Kafka: ' + JSON.stringify(data));
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.register', data),
      );
      return result;
    } catch (err) {
      this.logger.error('Error from Auth Service: ' + JSON.stringify(err));
      const message = err.message || 'Internal server error';
      const status = typeof err.status === 'number' ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    this.logger.log('Sending to Kafka: ' + JSON.stringify(data));
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.login', data),
      );
      return result;
    } catch (err) {
      this.logger.error('Error from Auth Service: ' + JSON.stringify(err));
      const message = err.message || 'Internal server error';
      const status = typeof err.status === 'number' ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  @Post('refresh')
  async refresh(@Body() data: { userId: number | string; refreshToken: string }) {
    const parsedData = {
      userId: typeof data.userId === 'string' ? parseInt(data.userId, 10) : data.userId,
      refreshToken: data.refreshToken,
    };
    this.logger.log('Sending to Kafka: ' + JSON.stringify(parsedData));
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.refresh', parsedData),
      );
      this.logger.log('Received from Auth Service: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      this.logger.error('Error from Auth Service: ' + JSON.stringify(err));
      const message = err.message || 'Internal server error';
      const status = typeof err.status === 'number' ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  @Post('edit')
  async edit(
    @Body() data: { email?: string; password?: string },
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader) {
      throw new HttpException('Authorization header required', HttpStatus.UNAUTHORIZED);
    }
    // Loại bỏ dấu ngoặc kép nếu có
    const cleanedAuthHeader = authHeader.replace(/^"|"$/g, '');
    this.logger.log('Sending to Kafka: ' + JSON.stringify({ editUserDto: data, authHeader: cleanedAuthHeader }));
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.edit', { editUserDto: data, authHeader: cleanedAuthHeader }),
      );
      this.logger.log('Received from Auth Service: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      this.logger.error('Error from Auth Service: ' + JSON.stringify(err));
      const message = err.message || 'Internal server error';
      const status = typeof err.status === 'number' ? err.status : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }
}