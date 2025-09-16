import { IsOptional, IsEnum, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { paymentStatus } from '../entities/registration.entity';

export class CreateRegistrationDto {
    @ApiProperty()
    @IsOptional()
    event_id: number;

    @ApiProperty()
    @IsNumber()
    user_id: number;

    @ApiProperty()
    @IsDate()
    registration_date: Date;

    @ApiProperty()
    @IsEnum(paymentStatus)
    payment_status: paymentStatus;
    
    @ApiProperty()
    @IsNumber()
    payment_amount: number;

    @ApiProperty()
    @IsDate()
    created_at: Date;

    @ApiProperty()
    @IsDate()
    updated_at: Date;
}
