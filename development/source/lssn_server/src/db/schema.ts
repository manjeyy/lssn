import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const permissionEnum = [
  'user:create',
  'user:read',
  'user:update',
  'user:delete',
  'post:create',
  'post:read',
  'post:update',
  'post:delete',
  'admin',
] as const;

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  permission: varchar('permission', { length: 64 }).notNull().unique(),
});

export const userPermissions = pgTable('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  userPermissionUnique: uniqueIndex('user_permission_unique').on(table.userId, table.permissionId),
}));