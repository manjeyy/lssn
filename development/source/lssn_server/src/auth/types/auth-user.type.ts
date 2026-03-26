import { Roles } from '../enums/roles.enum';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Roles;
}
