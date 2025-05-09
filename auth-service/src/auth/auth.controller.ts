import { Controller, Logger, BadRequestException, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto} from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(data: any) {
    this.logger.log('Received register request: ' + JSON.stringify(data));
    const registerDto = plainToClass(RegisterDto, data);
    const errors = await validate(registerDto);

    if (errors.length > 0) {
      const errorMessages = errors
        .filter(err => err.constraints)
        .map(err => Object.values(err.constraints!))
        .flat();
      if (errorMessages.length === 0) {
        errorMessages.push('Validation failed');
      }
      this.logger.warn('Validation failed for register: ' + JSON.stringify(errorMessages));
      throw new BadRequestException(errorMessages.join(', '));
    }

    return this.authService.register(registerDto);
  }

  @MessagePattern('auth.login')
  async login(data: any) {
    this.logger.log('Received login request: ' + JSON.stringify(data));
    const loginDto = plainToClass(LoginDto, data);
    const errors = await validate(loginDto);

    if (errors.length > 0) {
      const errorMessages = errors
        .filter(err => err.constraints)
        .map(err => Object.values(err.constraints!))
        .flat();
      if (errorMessages.length === 0) {
        errorMessages.push('Validation failed');
      }
      this.logger.warn('Validation failed for login: ' + JSON.stringify(errorMessages));
      throw new BadRequestException(errorMessages.join(', '));
    }

    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.refresh')
  async refresh(data: any) {
    this.logger.log('Received refresh request: ' + JSON.stringify(data));
    const refreshDto = plainToClass(RefreshDto, data);
    const errors = await validate(refreshDto);

    if (errors.length > 0) {
      const errorMessages = errors
        .filter(err => err.constraints)
        .map(err => Object.values(err.constraints!))
        .flat();
      if (errorMessages.length === 0) {
        errorMessages.push('Validation failed');
      }
      this.logger.warn('Validation failed for refresh: ' + JSON.stringify(errorMessages));
      throw new BadRequestException(errorMessages.join(', '));
    }

    return this.authService.refresh(refreshDto);
  }

  @MessagePattern('auth.edit')
  @UseGuards(JwtAuthGuard)
  async edit(data: { userId: number; editUserDto: EditUserDto; authHeader: string }) {
    this.logger.log('Received edit user request: ' + JSON.stringify(data));
    const editUserDto = plainToClass(EditUserDto, data.editUserDto);
    const errors = await validate(editUserDto);

    if (errors.length > 0) {
      const errorMessages = errors
        .filter(err => err.constraints)
        .map(err => Object.values(err.constraints!))
        .flat();
      if (errorMessages.length === 0) {
        errorMessages.push('Validation failed');
      }
      this.logger.warn('Validation failed for edit user: ' + JSON.stringify(errorMessages));
      throw new BadRequestException(errorMessages.join(', '));
    }

    return this.authService.editUser(data.userId, editUserDto);
  }
}