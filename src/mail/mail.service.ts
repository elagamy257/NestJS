import { Injectable, RequestTimeoutException } from "@nestjs/common";
import { User } from "../users/user.entity.js";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailService){}

  /**
   * sending email after user logged in his account
   * @param user the logged in user
   */
  public async sendLogEmail(email: string){
    try {
          const today = new Date();
          today.toLocaleDateString()
          await this.mailerService.sendMail({
            to: email,
            from: `<no-reply@my-nestjs-app.com>`,
            subject: 'log in',
            templete: 'login',
            context:{ email, today}
          })
    
        } catch (error) {
          console.log(error);
          throw new RequestTimeoutException();
        }
  }
}