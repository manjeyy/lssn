import { Inject, Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, inArray } from 'drizzle-orm';
import { DB } from '../db/db.provider';
import type { typeDB } from '../db/db.provider';
import { permissions as permissionsTable, userPermissions as userPermissionsTable, users } from '../db/schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './types/auth-result.type';
import { AuthUser } from './types/auth-user.type';
import { Permissions } from './enums/permissions.enum';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: typeDB,
    private readonly jwtService: JwtService,
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
      })
      .returning();

    if (!createdUser) {
      throw new InternalServerErrorException('Unable to create user');
    }

    const permissionsToAssign = dto.permissions?.length
      ? Array.from(new Set(dto.permissions))
      : [Permissions.UserRead];

    await this.ensurePermissionsExist(permissionsToAssign);
    await this.assignPermissions(createdUser.id, permissionsToAssign);

    const authUser = await this.buildAuthUser(createdUser.id);
    const accessToken = await this.signToken(authUser);

    return { accessToken, user: authUser };
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
    const accessToken = await this.signToken(authUser);

    return { accessToken, user: authUser };
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

    const permissionRows = await this.db
      .select({ permission: permissionsTable.permission })
      .from(userPermissionsTable)
      .innerJoin(permissionsTable, eq(userPermissionsTable.permissionId, permissionsTable.id))
      .where(eq(userPermissionsTable.userId, userRecord.id));

    const userPermissionsList = permissionRows
      .map((row) => row.permission)
      .filter(Boolean) as Permissions[];

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      permissions: userPermissionsList,
    };
  }

  private async ensurePermissionsExist(permissionsList: Permissions[]): Promise<void> {
    if (permissionsList.length === 0) {
      return;
    }

    const uniquePermissions = Array.from(new Set(permissionsList));

    await this.db
      .insert(permissionsTable)
      .values(uniquePermissions.map((permission) => ({ permission })))
      .onConflictDoNothing({ target: permissionsTable.permission });
  }

  private async assignPermissions(userId: number, permissionsList: Permissions[]): Promise<void> {
    if (permissionsList.length === 0) {
      return;
    }

    const uniquePermissions = Array.from(new Set(permissionsList));

    const permissionRecords = await this.db
      .select({ id: permissionsTable.id })
      .from(permissionsTable)
      .where(inArray(permissionsTable.permission, uniquePermissions));

    if (permissionRecords.length === 0) {
      return;
    }

    await this.db
      .insert(userPermissionsTable)
      .values(permissionRecords.map(({ id }) => ({ userId, permissionId: id })))
      .onConflictDoNothing({ target: [userPermissionsTable.userId, userPermissionsTable.permissionId] });
  }

  private async signToken(user: AuthUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      permissions: user.permissions,
    };

    return this.jwtService.signAsync(payload);
  }
}
