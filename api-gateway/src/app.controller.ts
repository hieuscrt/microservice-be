import { Controller, Get, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('auth')
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Đăng ký topic để gửi message
    this.authClient.subscribeToResponseOf('auth.login');
    await this.authClient.connect();
  }

  @Get('login')
  async login() {
    // Gửi message đến topic 'auth.login'
    return this.authClient.send('auth.login', {
      email: 'test@example.comffffdddd',
      password: 'password',
    });
  }

  @Get('loginee')
  async loginee() {
    // Gửi message đến topic 'auth.login'
    // return this.authClient.send('auth.login', {
    //   email: 'test@example.com',
    //   password: 'password',
    // });
    return 'aaa';
  }
}