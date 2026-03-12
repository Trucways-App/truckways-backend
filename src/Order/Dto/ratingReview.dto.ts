import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class RatingReviewDto {
    @ApiProperty({type:Number})
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    rating: number;
  
    @ApiProperty({type:String})
    @IsString()
    @IsOptional()
    review?: string;
  }



  