import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export enum SortOrder{
    ASC ='ASC',
    DESC ='DESC'
}

export class PaginationDto{
    @ApiProperty({type:Number, default:1})
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value,10))
    page:number = 1;

    @ApiProperty({type:Number, default:15})
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value,10))
    limit:number =15

    @ApiProperty({type:String, default:'createdAT'})
    @IsString()
    @IsOptional()
    sortBy:string ='createdAT';

    @ApiProperty({enum:SortOrder, default:SortOrder.DESC})
    @IsEnum(SortOrder)
    @IsOptional()
    sortOrder:SortOrder = SortOrder.DESC

}

export class SearchDto{
    @ApiProperty({type:String, default:1})
    @IsString()
    @IsOptional()
    keyword:string 

    @ApiProperty({type:Number, default:1})
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value,10))
    page:number =1

    @ApiProperty({type:Number, default:15})
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value,10))
    Perpage:number =15

    @ApiProperty({type:String, default:'createdAt'})
    @IsString()
    @IsOptional()
    sort:string ='createdAt';

    @ApiProperty({enum:SortOrder, default:SortOrder.DESC})
    @IsEnum(SortOrder)
    @IsOptional()
    sortOrder:SortOrder = SortOrder.DESC

}