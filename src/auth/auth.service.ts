import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto//create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Inject the User repository
    private configService: ConfigService, // Inject the ConfigService to access environment variables
    private jwtService: JwtService, // Inject the JwtService to handle JWT operations
  ) {}

  private async getTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email: email, role: role },
        {
          secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_SECRET',
          ),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedToken = await this.hashData(refreshToken);
    await this.userRepository.update(userId, {
      hashedRefreshToken: hashedToken,
    });
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email: email, role: role },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_SECRET',
        ),
        expiresIn: '1h',
      },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, email: email, role: role },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_SECRET',
        ),
        expiresIn: '7d',
      },
    );
    return { accessToken, refreshToken };
  }

  async SignUp(createAuthDto: CreateAuthDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['user_id', 'email', 'password'], // Select only necessary fields
    });
    if (existingUser) {
      throw new Error('User already exists');
    }
    // hash password
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    // create and save new user
    const user = this.userRepository.create({
      ...createAuthDto,
      password: hashedPassword,
    });
    // generate tokens
    const savedUser = await this.userRepository.save(user);
    const { accessToken, refreshToken } = await this.generateTokens(
      savedUser.user_id,
      savedUser.email,
      savedUser.role, // Assuming role is stored in the user entity
    );

    // Save refresh token in the database
    await this.saveRefreshToken(savedUser.user_id, refreshToken);

    // Return user and tokens
    // Fetch updated user (with hashedRefreshToken)
    const updatedUser = await this.userRepository.findOne({
      where: { user_id: savedUser.user_id },
    });
    return { user: updatedUser, accessToken, refreshToken };
  }

  async SignIn(createAuthDto: CreateAuthDto) {
    const foundUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
      select: ['user_id', 'email', 'password','role'],
    });
    if (!foundUser) {
      throw new NotFoundException(
        `User with email ${createAuthDto.email} not found`,
      );
    }

    // Check password
    // console.log('Password:', createAuthDto.password);
    // console.log('Found password:', foundUser.password);
    const foundPassword = await bcrypt.compare(
      createAuthDto.password,
      foundUser.password, // Assuming password is stored in the user entity
    );
    if (!foundPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.user_id,
      foundUser.email,
      foundUser.role, // Assuming role is stored in the user entity
    );

    // Save refresh token in the database
    await this.saveRefreshToken(foundUser.user_id, refreshToken);

    // Return user and tokens
    return { foundUser, accessToken, refreshToken };
  }

  async signOut(userId: number) {
    // set user refresh token to null
    const res = await this.userRepository.update(userId, {
      hashedRefreshToken: null,
    });

    if (res.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return { message: `User with id : ${userId} signed out successfully` };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const foundUser = await this.userRepository.findOne({
      where: { user_id: userId },
      select: ['user_id', 'email', 'hashedRefreshToken', 'role'], // Select only necessary fields
    });

    if (!foundUser) {
      throw new Error('User not found');
    }
    if (!foundUser.hashedRefreshToken) {
      throw new Error('Refresh token not found');
    }

    // Verify the refresh token
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      foundUser.hashedRefreshToken, // Assuming hashedRefreshToken is stored in the user entity
    );

    if (!isRefreshTokenValid) {
      throw new Error('Invalid refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(foundUser.user_id, foundUser.email, foundUser.role);
    await this.saveRefreshToken(foundUser.user_id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
