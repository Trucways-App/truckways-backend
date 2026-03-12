import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.get('SERVICE'),
          host: configService.get('EMAIL_HOST'),
          port: configService.get('PORT_MAIL'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('AUTH_EMAIL'),
            pass: configService.get('AUTH_PASS'),
          },
        },
        defaults: {
          from: '"TRUCKWAYS" <' + configService.get('AUTH_EMAIL') + '>',
        },
        preview: false,
        options: {
          strict: true,
          validateCSS: true,
        },
        template: {
          dir: process.cwd() + '/templates/',
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MailModule {}
