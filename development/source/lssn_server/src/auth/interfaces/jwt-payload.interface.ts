import { Permissions } from '../enums/permissions.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  permissions: Permissions[];
  iat?: number;
  exp?: number;
}
