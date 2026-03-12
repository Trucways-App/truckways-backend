import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator"
import { CustomerEntity } from "src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity"
import { CartItemsEntity } from "../Infrastructure/Persistence/Relational/Entity/order-cart-items.entity"

export class OrderCart{

    @ApiProperty({type:Number})
    @IsNumber()
    id:number

    @ApiProperty({type:String})
    @IsString()
    orderCartID:string

    @ApiProperty({type:()=>CustomerEntity})
    customer:CustomerEntity

    @ApiProperty({type:Boolean})
    @IsBoolean()
    checkedOut:boolean

    @ApiProperty()
    @IsDate()
    createdAt:Date

    @ApiProperty()
    @IsDate()
    LastcheckoutedAT:Date

    @ApiProperty({type:()=>[CartItemsEntity]})
    items:CartItemsEntity[]
}