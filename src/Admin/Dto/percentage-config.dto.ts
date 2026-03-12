import { IsEnum, IsNumber, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PercentageType } from 'src/Enums/percentage.enum';

export class CreatePercentageDto {
  @ApiProperty({ enum: PercentageType })
  @IsEnum(PercentageType)
  type: PercentageType;

  @ApiProperty({ type: Number, example: '3' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;
}

export class UpdatePercentageDto {

  
    @ApiPropertyOptional({ type: Number, example: '3' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    percentage: number;
  }
