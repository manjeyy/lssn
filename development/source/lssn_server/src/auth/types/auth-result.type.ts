import { AuthUser } from './auth-user.type';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
