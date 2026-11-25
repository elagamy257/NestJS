import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service.js';
import { MailService } from './mail.service.js';

@Module({
  providers: [MailerService, MailService],
  exports: [MailService],
})
export class MailModule {}
