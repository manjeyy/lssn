import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { DB } from '../db/db.provider';
import type { typeDB } from '../db/db.provider';
import { refreshSessions, users } from '../db/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from './enums/roles.enum';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResult } from './types/auth-result.type';
import { AuthUser } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: typeDB,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase();
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const [createdUser] = await this.db
      .insert(users)
      .values({
        name: dto.name.trim(),
        email,
        passwordHash,
        role: Roles.Creator,
      })
      .returning();

    if (!createdUser) {
      throw new InternalServerErrorException('Unable to create user');
    }

    const authUser = await this.buildAuthUser(createdUser.id);
    const accessToken = await this.signAccessToken(authUser);
    const refreshToken = await this.createRefreshToken(authUser.id);

    return { accessToken, refreshToken, user: authUser };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase();
    const userRecord = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!userRecord) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, userRecord.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUser = await this.buildAuthUser(userRecord.id);
    const accessToken = await this.signAccessToken(authUser);
    const refreshToken = await this.createRefreshToken(authUser.id);

    return { accessToken, refreshToken, user: authUser };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const refreshSecret = this.getRefreshSecret();
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh' || !payload.tokenId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.db.query.refreshSessions.findFirst({
      where: eq(refreshSessions.tokenId, payload.tokenId),
    });

    if (!session || session.revokedAt || session.isRotated) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const matches = await bcrypt.compare(refreshToken, session.tokenHash);
    if (!matches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    await this.db
      .update(refreshSessions)
      .set({ revokedAt: new Date(), isRotated: true })
      .where(eq(refreshSessions.id, session.id));

    const authUser = await this.buildAuthUser(payload.sub);
    const accessToken = await this.signAccessToken(authUser);
    const newRefreshToken = await this.createRefreshToken(authUser.id);

    return { accessToken, refreshToken: newRefreshToken, user: authUser };
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshSecret = this.getRefreshSecret();
    let payload: JwtPayload | null = null;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      return;
    }

    if (!payload?.tokenId) {
      return;
    }

    await this.db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(eq(refreshSessions.tokenId, payload.tokenId));
  }

  async profile(userId: number): Promise<AuthUser> {
    return this.buildAuthUser(userId);
  }

  private async buildAuthUser(userId: number): Promise<AuthUser> {
    const userRecord = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userRecord) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role as Roles,
    };
  }

  private async signAccessToken(user: AuthUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenType: 'access',
    };

    return this.jwtService.signAsync(payload as any, {
      secret: this.getAccessSecret(),
      expiresIn: this.getAccessExpiresIn(),
    } as any);
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const tokenId = randomUUID();
    const payload: JwtPayload = {
      sub: userId,
      role: Roles.Viewer,
      tokenType: 'refresh',
      tokenId,
      email: '',
      name: '',
    };

    const refreshToken = await this.jwtService.signAsync(payload as any, {
      secret: this.getRefreshSecret(),
      expiresIn: this.getRefreshExpiresIn(),
    } as any);

    const tokenHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = this.getExpiryDate(this.getRefreshExpiresIn());

    await this.db.insert(refreshSessions).values({
      userId,
      tokenId,
      tokenHash,
      expiresAt,
    });

    return refreshToken;
  }

  private getAccessSecret(): string {
    return this.configService.get<string>('JWT_ACCESS_SECRET')
      ?? this.configService.get<string>('JWT_SECRET')
      ?? 'change-me';
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET')
      ?? this.configService.get<string>('JWT_SECRET')
      ?? 'change-me';
  }

  private getAccessExpiresIn(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
  }

  private getRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
  }

  private getExpiryDate(expiresIn: string): Date {
    const fallbackMs = 30 * 24 * 60 * 60 * 1000;
    const ms = this.toMilliseconds(expiresIn);
    return new Date(Date.now() + (ms || fallbackMs));
  }

  private toMilliseconds(value: string): number {
    const trimmed = value.trim();
    const match = /^([0-9]+)(ms|s|m|h|d)?$/.exec(trimmed);
    if (!match) {
      return 0;
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? 'ms';

    switch (unit) {
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 's':
        return amount * 1000;
      default:
        return amount;
    }
  }
}
