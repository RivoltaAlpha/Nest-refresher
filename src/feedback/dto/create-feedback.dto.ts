import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  feedback_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  event_id: number; // Reference to eventstable

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  user_id: number; // Reference to userstable

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comments: string;
  @ApiProperty()
  @IsOptional()
  @IsDate()
  created_at: Date;
}
