import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Event id' })
  @IsNotEmpty()
  @IsNumber()
  event_id: number;

  @ApiProperty({ description: 'User id' })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  created_at?: string;
}
