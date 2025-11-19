import { AuthUser } from './auth-user.type';

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}
