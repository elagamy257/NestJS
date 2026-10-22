import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { RegisterDto } from "./dtos/register.dto.js";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dtos/login.dto.js";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenType, JWTPayloadType } from "../utils/type.js";

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

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

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
  async getCurrentUser(id: number): Promise <User>{
    const user = await this.usersRepository.findOne({ where: { id} });
    if (!user) throw new BadRequestException("User not found");
    return user;
  }

  /**
   * Get all users from db
   * @param 
   * @returns collections of users
   */
  getAll(): Promise <User[]>{
       return this.usersRepository.find();
  }

  /**
  * generate json web token
  * @param payload jwt payload
  * @returns roken
  */
  private generateJWT(payload: JWTPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
