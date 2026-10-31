import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { JWTPayloadType } from "../utils/type.js";
import { UpdateUserDto } from "./dtos/update-user.dto.js";
import { UserType } from "../utils/enums.js";
import { AuthProvider } from "./auth.provider.js";
import { RegisterDto } from "./dtos/register.dto.js";
import { LoginDto } from "./dtos/login.dto.js";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { ResetPassDto } from "./dtos/reset-password.dto.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authProvider: AuthProvider,
  ) { }

  /**
     * create new user
     * @param registerDto data for creating new user
     * @returns JWT (access token)
     */
  async register(registerDto: RegisterDto) {
    return this.authProvider.register(registerDto);
  }

  /**
     * login user
     * @param registerDto data for login user
     * @returns JWT (access token)
     */
  async login(loginDto: LoginDto) {
    return this.authProvider.login(loginDto);
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
      user.password = await this.authProvider.hashPassword(password);
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
   * set Profile Image
   * @param userId id for logged user
   * @param newImageProfile profile image
   * @returns user from db
   */
  async setProfileImage(userId: number, newImageProfile: string) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage) {
      user.profileImage = newImageProfile;
    } else {
      await this.removeProfileImage(userId);
      user.profileImage = newImageProfile;
    }

    return this.usersRepository.save(user);
  }

  /**
   * remove Profile Image
   * @param userId id for logged user
   * @returns user from db
   */
  async removeProfileImage(userId: number) {
    const user = await this.getCurrentUser(userId);
    if (!user.profileImage)
      throw new BadRequestException("there is no profile image");

    const imagePath = join(process.cwd(), `./images/users/${user.profileImage}`);
    if (existsSync(imagePath)) {
      unlinkSync(imagePath);
    }

    user.profileImage = null as any;
    return this.usersRepository.save(user);
  }

  /**
   * verify Email
   * @param userId
   * @param verificationToken verification token from the link
   * @returns success message
   */
  async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.getCurrentUser(userId);

    if (user.verificationToken === null)
      throw new NotFoundException("there is no verification token");

    if (user.verificationToken !== verificationToken)
      throw new BadRequestException("invalid link")

    user.isAccountVerified = true;
    user.verificationToken = null;

    await this.usersRepository.save(user);
    return { message: "Your email has been verified, please log in to your account" }
  }

  /**
   * sending Reset Password template
   * @param email email of the user
   * @returns success message
   */
  sendResetPassword(email: string) {
    return this.authProvider.sendResetPasswordLink(email);
  }

  /**
   * get Reset Password link
   * @param userId user id from the link
   * @param resetPasswordToken reset pass token from the link
   * @returns success message
   */
  getResetPassword(userId: number, resetPasswordToken: string) {
    return this.authProvider.getResetPasswordLink(userId, resetPasswordToken);
  }

  /**
   * reset the password
   * @param dto data for reset the password
   * @returns success message
   */
  resetPassword(dto: ResetPassDto) {
    return this.authProvider.resetPassword(dto);
  }


}
