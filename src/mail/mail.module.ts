import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { inject } from "vitest";
import { MailService } from "./mail.service.js";
import { join } from "path";


@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            host: config.get<string>("SMIP_HOST"),
            port: config.get<number>("SMIP_PORT"),
            secure: false,
            auth: {
              user: config.get<string>("SMIP_USERNAME"),
              pass: config.get<string>("SMIP_PASSWORD"),
            }
          },
          template: {
            dir: join(__dirname, 'templates'),
            adabter: new EjsAdapter({
              inlineCssEnabled: true
            })
          }
        }
      }
    })

  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {

}