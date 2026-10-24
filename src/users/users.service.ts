import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { RegisterDto } from "./dtos/register.dto.js";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dtos/login.dto.js";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenType, JWTPayloadType } from "../utils/type.js";
import { UpdateUserDto } from "./dtos/update-user.dto.js";
import { UserType } from "../utils/enums.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  async register(registerDto: RegisterDto): Promise<AccessTokenType> {
    const { email, password, username } = registerDto;

    const userFromDto = await this.usersRepository.findOne({ where: { email } });
    if (userFromDto) throw new BadRequestException("user already exist");

    const hashedPass = await this.hashPassword(password);

    let newUser = this.usersRepository.create({
      email,
      username,
      password: hashedPass
    });

    newUser = await this.usersRepository.save(newUser);
    const accessToken = await this.generateJWT({ id: newUser.id, userType: newUser.userType });
    return { accessToken };
  }

  /**
   * login user
   * @param registerDto data for login user
   * @returns JWT (access token)
   */
  async login(loginDto: LoginDto): Promise<AccessTokenType> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("invalid email or password");

    const isPassmatch = await bcrypt.compare(password, user.password);
    if (!isPassmatch) throw new BadRequestException("invalid email or password");

    const accessToken = await this.generateJWT({ id: user.id, userType: user.userType });

    return { accessToken };

  }

  /**
   * Get Current user (logged in user)
   * @param id id for login user
   * @returns user from db
   */
  async getCurrentUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException("User not found");
    return user;
  }

  /**
   * Get all users from db
   * @param 
   * @returns collections of users
   */
  getAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Update user
   * @param id id for logged in user
   * @param updateUserDto data for updating user
   * @returns updayed user from db
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, username } = updateUserDto;
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    user.username = username ?? user.username;
    if (password) {
      user.password = await this.hashPassword(password);
    }

    return this.usersRepository.save(user);
  }

  /**
   * Deleted user
   * @param userId id for logged in user
   * @param payload JwtPayload
   * @returns a success message
   */
  async delete(userId: number, payload: JWTPayloadType) {
    const user = await this.getCurrentUser(userId);
    if (user.id === payload?.id || payload.userType === UserType.ADMIN) {
      await this.usersRepository.remove(user);
      return { message: 'User has been deleted' }
    }
    throw new ForbiddenException("access denied, you are not allowed");
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
   * Hashing password
   * @param password plain text password
   * @returns hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt)
  }
}
