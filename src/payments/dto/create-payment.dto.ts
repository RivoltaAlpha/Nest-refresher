import { IsNotEmpty, IsOptional, IsEnum, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { paymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
    @ApiPropertyOptional()
    @IsOptional()
    payment_id?: number;

    @ApiProperty({ description: 'Registration id this payment belongs to' })
    @IsNotEmpty()
    @IsNumber()
    registration_id: number;

    @ApiProperty({ example: '2025-10-22T12:00:00Z' })
    @IsNotEmpty()
    @IsDateString()
    payment_date: string;

    @ApiProperty({ example: 100 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    payment_method: string;

    @ApiPropertyOptional({ enum: paymentStatus })
    @IsOptional()
    @IsEnum(paymentStatus)
    payment_status?: paymentStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    created_at?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    updated_at?: string;
}
