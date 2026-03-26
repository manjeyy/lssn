import { Roles } from '../enums/roles.enum';

export interface JwtPayload {
  sub: number;
  email?: string;
  name?: string;
  role: Roles;
  tokenType?: 'access' | 'refresh';
  tokenId?: string;
  iat?: number;
  exp?: number;
}
