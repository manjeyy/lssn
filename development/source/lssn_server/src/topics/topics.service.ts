import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type typeDB } from '../db/db.provider';
import { topics } from '../db/schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(@Inject(DB) private readonly db: typeDB) {}

  async list() {
    return this.db.query.topics.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    });
  }

  async create(dto: CreateTopicDto) {
    const slug = this.toSlug(dto.slug ?? dto.name);
    const [created] = await this.db
      .insert(topics)
      .values({
        name: dto.name.trim(),
        slug,
      })
      .returning();

    if (!created) {
      throw new NotFoundException('Unable to create topic');
    }

    return created;
  }

  async update(id: number, dto: UpdateTopicDto) {
    const existing = await this.db.query.topics.findFirst({
      where: eq(topics.id, id),
    });

    if (!existing) {
      throw new NotFoundException('Topic not found');
    }

    const slug = dto.slug ? this.toSlug(dto.slug) : dto.name ? this.toSlug(dto.name) : existing.slug;

    const [updated] = await this.db
      .update(topics)
      .set({
        name: dto.name?.trim() ?? existing.name,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, id))
      .returning();

    return updated ?? existing;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning({ id: topics.id });

    if (!deleted) {
      throw new NotFoundException('Topic not found');
    }

    return { success: true };
  }

  private toSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}
