import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from "class-validator";

export class CreateEventDto {
    @ApiProperty({ example: 'Nest Workshop' })
    @IsNotEmpty()
    @IsString()
    event_name: string;

    @ApiProperty({ example: '2025-10-22T10:00:00Z' })
    @IsNotEmpty()
    @IsDateString()
    event_date: string;

    @ApiProperty({ example: 'Main Hall' })
    @IsNotEmpty()
    @IsString()
    event_location: string;

    @ApiProperty({ example: 'A workshop about NestJS' })
    @IsNotEmpty()
    @IsString()
    event_description: string;

    @ApiProperty({ description: 'User id of the event creator' })
    @IsNotEmpty()
    @IsNumber()
    created_by: number; // Reference to users table (organizer)

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    created_at?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    updated_at?: string;
}
