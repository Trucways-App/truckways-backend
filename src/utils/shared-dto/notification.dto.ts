import { ApiProperty, } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, } from 'class-validator';

export class CreateNotificationsDto {
 
  @ApiProperty({ type:String,example: 'UserSignUp!' })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  subject: string;

  @ApiProperty({ type:String, example: 'user have signed up successfully' })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  message: string;


  @ApiProperty({type:String})
  @IsNotEmpty()
  account: string;

}



export class markMultipleNotificationsAsReadDto{
    @IsArray({each:true})
    @IsString()
    notificationIds:string[]
}
  