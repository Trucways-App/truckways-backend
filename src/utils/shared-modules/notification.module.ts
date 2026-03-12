import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "../services/notifications.service";
import { NotificationsEntity } from "../shared-entities/notification.entity";
import { GeneratorService } from "../services/generator.service";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports:[TypeOrmModule.forFeature([NotificationsEntity])],
    providers:[NotificationsService],
    exports:[NotificationsService]
})

export class NotificationModule{}