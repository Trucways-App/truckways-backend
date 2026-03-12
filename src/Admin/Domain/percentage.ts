import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsNumber } from 'class-validator';
import { PercentageType } from 'src/Enums/percentage.enum';

export class PercentageConfig {
  @ApiProperty({ type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ enum: PercentageType })
  @IsEnum(PercentageType)
  type: PercentageType;

  @ApiProperty({ type: Number })
  @IsNumber()
  percentage: number;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsDate()
  createdAT: Date;

  @ApiProperty()
  @IsDate()
  updatedAT: Date;
}
