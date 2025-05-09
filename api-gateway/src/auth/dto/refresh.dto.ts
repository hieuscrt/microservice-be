import { IsInt, IsString } from 'class-validator';

export class RefreshDto {
  @IsInt({ message: 'User ID must be an integer' })
  userId: number;

  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}