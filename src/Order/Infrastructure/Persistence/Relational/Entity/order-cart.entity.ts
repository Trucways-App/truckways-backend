import { ApiProperty } from "@nestjs/swagger";
import { CustomerEntity } from "src/Customer/Infrastructure/Persistence/Relational/Entity/customer.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CartItemsEntity } from "./order-cart-items.entity";

@Entity({name:'Order-cart'})
export class OrderCartEntity{

    @ApiProperty({type:Number})
    @PrimaryGeneratedColumn()
    id:number

    @ApiProperty({type:String})
    @Column({nullable:true})
    orderCartID:string

    @ApiProperty({type:()=>CustomerEntity})
    @OneToOne(()=>CustomerEntity,(customer)=>customer.my_cart)
    @JoinColumn() 
    customer:CustomerEntity

    @ApiProperty({type:Boolean})
    @Column({nullable:true, type:'boolean'})
    checkedOut:boolean

    @ApiProperty()
    @Column({nullable:true,type:'timestamp'})
    createdAt:Date

    @ApiProperty()
    @Column({nullable:true,type:'timestamp'})
    LastcheckoutedAT:Date

    @ApiProperty({type:()=>[CartItemsEntity]})
    @OneToMany(()=>CartItemsEntity,(items)=>items.cart)
    items:CartItemsEntity[]

  

    

    
}