import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { JWTPayloadType } from '../utils/type.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service.js';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const userFromDto = await this.usersRepository.findOne({
      where: { email },
    });
    if (userFromDto) throw new BadRequestException('user already exist');

    const hashedPass = await this.hashPassword(password);

    let newUser = this.usersRepository.create({
      email,
      username,
      password: hashedPass,
      verificationToken: randomBytes(32).toString('hex'),
    }) as User;

    newUser = await this.usersRepository.save(newUser);
    const link = this.generateLink(newUser.id, newUser.verificationToken ?? '');
    await this.mailService.sendVerifyEmailTemplete(email, link);
    await this.generateJWT({ id: newUser.id, userType: newUser.userType });
    return {
      message:
        'verification token has been send to your email, please verify your email address',
    };
  }

  /**
   * login user
   * @param registerDto data for login user
   * @returns JWT (access token)
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('invalid email or password');

    const isPassmatch = await bcrypt.compare(password, user.password);
    if (!isPassmatch)
      throw new BadRequestException('invalid email or password');

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken ?? '';

      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        const result = await this.usersRepository.save(user);
        verificationToken = result.verificationToken ?? '';
      }

      const link = this.generateLink(user.id, verificationToken);
      await this.mailService.sendVerifyEmailTemplete(email, link);

      return {
        message:
          'verification token has been send to your email, please verify your email address',
      };
    }
    const accessToken = await this.generateJWT({
      id: user.id,
      userType: user.userType,
    });
    return { accessToken };
  }

  /**
   * Hashing password
   * @param password plain text password
   * @returns hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * generate json web token
   * @param payload jwt payload
   * @returns roken
   */
  private generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  /**
   * Generate email verification link
   * @param userId
   * @param verificationToken
   */
  private generateLink(userId: number, verificationToken: string) {
    return `${this.config.get<string>('DOMAIN')}/api/users/verify-email/${userId}/${verificationToken}`;
  }
}
