import { IsEnum } from 'class-validator';
import { Roles } from '../../auth/enums/roles.enum';

export class UpdateRoleDto {
  @IsEnum(Roles)
  role: Roles;
}
