import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { RegisterDto } from "./dtos/register.dto.js";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dtos/login.dto.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  /**
   * create new user
   * @param registerDto data for creating new user
   * @returns JWT (access token)
   */
  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const userFromDto = await this.usersRepository.findOne({ where: { email } });
    if (userFromDto) throw new BadRequestException("user already exist");

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      email,
      username,
      password: hashedPass
    });

    await this.usersRepository.save(newUser);

    return newUser;
  }

    /**
   * login user
   * @param registerDto data for login user
   * @returns JWT (access token)
   */
  async login(loginDto: LoginDto){
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException("invalid email or password");

    const isPassmatch= await bcrypt.compare(password, user.password);
    if (!isPassmatch) throw new BadRequestException("invalid email or password");

    return user;

  }
}
