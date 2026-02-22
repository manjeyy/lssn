import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DB, type typeDB } from '../db/db.provider';
import { users } from '../db/schema';
import { Roles } from '../auth/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: typeDB) {}

  async listUsers() {
    return this.db.query.users.findMany({
      columns: {
        passwordHash: false,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  }

  async getUser(id: number) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRole(id: number, role: Roles) {
    const [updated] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async deleteUser(id: number) {
    const [deleted] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }
}
