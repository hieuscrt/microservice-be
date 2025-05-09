import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto} from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const { email, password } = data;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);

    return { message: 'User registered successfully' };
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async refresh(data: RefreshDto) {
    const { userId, refreshToken } = data;
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      console.log('Verified payload:', payload, 'userId:', parsedUserId, 'raw userId:', userId);

      if (payload.sub !== parsedUserId) {
        throw new BadRequestException('Invalid refresh token: userId mismatch');
      }

      console.log('Querying user with id:', parsedUserId);
      const user = await this.userRepository.findOne({ where: { id: parsedUserId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      console.log('Found user:', process.env.JWT_SECRET, process.env.DB_PASSWORD,process.env.DB_DATABASE);

      console.log('Generating new access token for user:', user.id, user.email);
      const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
      const response = { accessToken };
      console.log('Returning response:', response);
      return response;
    } catch (err) {
      console.error('Error in refresh:', err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(`Refresh failed: ${err.message}`);
    }
  }

  async editUser(userId: number, data: EditUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (data.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
      user.email = data.email;
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    await this.userRepository.save(user);
    return { message: 'User updated successfully' };
  }
}