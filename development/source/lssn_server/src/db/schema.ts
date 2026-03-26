import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['viewer', 'creator', 'admin']);
export const lssnStatusEnum = pgEnum('lssn_status', ['draft', 'published']);
export const reactionEnum = pgEnum('slide_reaction', ['like', 'dislike']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('creator'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lssns = pgTable('lssns', {
  id: serial('id').primaryKey(),
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  status: lssnStatusEnum('status').notNull().default('draft'),
  content: jsonb('content').notNull(),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  slidesCount: integer('slides_count').notNull().default(0),
  views: integer('views').notNull().default(0),
  likesCount: integer('likes_count').notNull().default(0),
  dislikesCount: integer('dislikes_count').notNull().default(0),
  rating: numeric('rating', { precision: 5, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
});

export const slides = pgTable('slides', {
  id: serial('id').primaryKey(),
  lssnId: integer('lssn_id').notNull().references(() => lssns.id, { onDelete: 'cascade' }),
  slideIndex: integer('slide_index').notNull(),
  likesCount: integer('likes_count').notNull().default(0),
  dislikesCount: integer('dislikes_count').notNull().default(0),
}, (table) => ({
  slideUnique: uniqueIndex('slide_unique').on(table.lssnId, table.slideIndex),
}));

export const slideReactions = pgTable('slide_reactions', {
  id: serial('id').primaryKey(),
  lssnId: integer('lssn_id').notNull().references(() => lssns.id, { onDelete: 'cascade' }),
  slideIndex: integer('slide_index').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reaction: reactionEnum('reaction').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  reactionUnique: uniqueIndex('slide_reaction_unique').on(table.lssnId, table.slideIndex, table.userId),
}));

export const refreshSessions = pgTable('refresh_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenId: varchar('token_id', { length: 64 }).notNull().unique(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isRotated: boolean('is_rotated').notNull().default(false),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 140 }).notNull().unique(),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 140 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lssnCategories = pgTable('lssn_categories', {
  id: serial('id').primaryKey(),
  lssnId: integer('lssn_id').notNull().references(() => lssns.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  lssnCategoryUnique: uniqueIndex('lssn_category_unique').on(table.lssnId, table.categoryId),
}));

export const lssnTopics = pgTable('lssn_topics', {
  id: serial('id').primaryKey(),
  lssnId: integer('lssn_id').notNull().references(() => lssns.id, { onDelete: 'cascade' }),
  topicId: integer('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
}, (table) => ({
  lssnTopicUnique: uniqueIndex('lssn_topic_unique').on(table.lssnId, table.topicId),
}));