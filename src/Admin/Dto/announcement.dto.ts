import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AnnonuncmentTargetUser, AnnouncementMeduim } from "src/Enums/announcement.enum";

export class MakeAnnouncementDto{
    @ApiProperty({type:String, example:'inusrance fee Incresee'})
    @IsString()
    @IsNotEmpty()
    title:string


    @ApiProperty({type:String, example:'good afteroon all, we are bringing this to your notice . Thank you'})
    @IsString()
    @IsNotEmpty()
    body:string

    @ApiProperty({enum:AnnouncementMeduim, example:AnnouncementMeduim.EMAIL})
    @IsEnum(AnnouncementMeduim)
    announcementMedium:AnnouncementMeduim

    @ApiProperty({enum:AnnonuncmentTargetUser, example:AnnonuncmentTargetUser.RIDERS})
    @IsEnum(AnnonuncmentTargetUser)
    targetUser:AnnonuncmentTargetUser



}