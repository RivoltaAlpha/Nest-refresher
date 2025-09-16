import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateEventDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_location: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    event_description: string;

    @ApiProperty()
    @IsNotEmpty()
    created_by: number; // Reference to userstable (organizer)

    created_at: string;
    updated_at: string;
}
