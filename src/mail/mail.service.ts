import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { MailerService } from './mailer.service.js';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * sending email after user logged in his account
   * @param user the logged in user
   */
  public async sendLogEmail(email: string) {
    try {
      const today = new Date();
      today.toLocaleDateString();
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'log in',
        template: 'login',
        context: { email, today },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending verify email template
   * @param email email of the registered user
   * @param link link with id of the user and verification token
   */
  public async sendVerifyEmailTemplete(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'verify your account',
        template: 'verify-email',
        context: { link },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending reset password template
   * @param email email of the registered user
   * @param resetPasswordLink link with id of the user and reset pass token
   */
  public async sendResetPassTemplete(email: string, resetPasswordLink: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'reset password',
        template: 'reset-password',
        context: { resetPasswordLink },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
