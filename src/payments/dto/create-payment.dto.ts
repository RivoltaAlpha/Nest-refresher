import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, IsString, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { paymentStatus } from '../entities/payment.entity';


export class CreatePaymentDto {
    @ApiProperty()
    @IsOptional()
    payment_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    registration_id: number;

    @ApiProperty()
    @IsNotEmpty()
    payment_date: string;

    @ApiProperty()
    @IsNotEmpty()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    payment_method: string;
    
    @ApiProperty()
    @IsNotEmpty()
    payment_status: paymentStatus;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}
