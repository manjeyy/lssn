import { Permissions } from '../enums/permissions.enum';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  permissions: Permissions[];
}
