import { Repository } from "typeorm";
import { AuthProvider } from "./auth.provider.js"
import { User } from "./user.entity.js";
import { MailService } from "../mail/mail.service.js";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RegisterDto } from "./dtos/register.dto.js";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";

describe('AuthProvider', () => {
  let authProvider: AuthProvider;
  let usersRepository: Repository<User>;
  let mailService: MailService;
  let configService: ConfigService;
  const Repository_Token = getRepositoryToken(User);
  const registerDto: RegisterDto = {
    email: 'admin@gmail.com',
    username: 'admin',
    password: '123456'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProvider,
        { provide: JwtService, useValue: {
          signAsync: vi.fn().mockResolvedValue("mock-jwt-token"),
    verifyAsync: vi.fn(),
        } },
        {
          provide: MailService, useValue: {
            sendVerifyEmailTemplete: vi.fn()
          }
        },
        {
          provide: ConfigService, useValue: {
            get: vi.fn()
          }
        },
        {
          provide: Repository_Token, useValue: {
            findOne: vi.fn(),
            create: vi.fn((dto: RegisterDto) => Promise.resolve(dto)),
            save: vi.fn((user: User) => Promise.resolve({...user })),
          }
        },
      ]
    }).compile();

    authProvider = module.get<AuthProvider>(AuthProvider);
    usersRepository = module.get<Repository<User>>(Repository_Token);
    mailService = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should authProvider be defined", () => {
    expect(authProvider).toBeDefined();
  })

  it("should usersRepository be defined", () => {
    expect(usersRepository).toBeDefined();
  })

  //Register
  describe('register()', () => {
    it("should call findOne method in users Repository", async () => {
      await authProvider.register(registerDto);
      expect(usersRepository.findOne).toHaveBeenCalled();
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
    })
    it("should call save method in product Repository", async () => {
      await authProvider.register(registerDto);
      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    })
    it("should call sendVerifyEmailTemplete method in mail service", async () => {
      await authProvider.register(registerDto);
      expect(mailService.sendVerifyEmailTemplete).toHaveBeenCalled();
      expect(mailService.sendVerifyEmailTemplete).toHaveBeenCalledTimes(1);
    })

    it("should call get method in config service", async () => {
      await authProvider.register(registerDto);
      expect(configService.get).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledTimes(1);
    })
  })



})