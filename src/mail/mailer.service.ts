import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mailTemplates } from './templates.js';
// @ts-ignore no bundled types
import * as nodemailerNs from 'nodemailer';
// @ts-ignore no bundled types
import * as ejsNs from 'ejs';

const nodemailer: any = (nodemailerNs as any).default ?? nodemailerNs;
const ejs: any = (ejsNs as any).default ?? ejsNs;

export interface SendMailOptions {
  to: string;
  from?: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
}

@Injectable()
export class MailerService {
  private transporter: any;

  constructor(private readonly config: ConfigService) {}

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST'),
        port: Number(this.config.get<string>('SMTP_PORT')),
        secure: false,
        auth: {
          user: this.config.get<string>('SMTP_USERNAME'),
          pass: this.config.get<string>('SMTP_PASSWORD'),
        },
      });
    }
    return this.transporter;
  }

  async sendMail(options: SendMailOptions) {
    const file = mailTemplates[options.template];
    if (!file) throw new Error(`Unknown mail template: ${options.template}`);
    const html = ejs.render(file, options.context ?? {}, { strict: false });
    return this.getTransporter().sendMail({
      from: options.from ?? '"No Reply" <no-reply@my-nestjs-app.com>',
      to: options.to,
      subject: options.subject,
      html,
    });
  }
}
