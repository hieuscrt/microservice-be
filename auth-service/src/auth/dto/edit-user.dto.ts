import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class EditUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsOptional()
  password?: string;
}