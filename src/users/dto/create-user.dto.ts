import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.User })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Optional refresh token hash' })
  @IsOptional()
  @IsString()
  hashedRefreshToken?: string | null;
}
