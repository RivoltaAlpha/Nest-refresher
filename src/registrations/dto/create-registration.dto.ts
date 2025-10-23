import { IsOptional, IsEnum, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { paymentStatus } from '../entities/registration.entity';

export class CreateRegistrationDto {
    @ApiPropertyOptional({ description: 'Event id to register for' })
    @IsOptional()
    @IsNumber()
    event_id?: number;

    @ApiProperty({ description: 'User id registering' })
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    registration_date?: string;

    @ApiPropertyOptional({ enum: paymentStatus })
    @IsOptional()
    @IsEnum(paymentStatus)
    payment_status?: paymentStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    payment_amount?: number;
}
