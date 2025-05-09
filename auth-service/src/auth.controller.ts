import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  @MessagePattern('auth.login')
  handleLogin(data: { email: string; password: string }) {
    // Xử lý logic đăng nhập
    console.log('Received login request:', data);
    return { message: 'Login processed', user: data.email };
  }
}