import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type typeDB } from '../db/db.provider';
import { categories } from '../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB) private readonly db: typeDB) {}

  async list() {
    return this.db.query.categories.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    });
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.toSlug(dto.slug ?? dto.name);
    const [created] = await this.db
      .insert(categories)
      .values({
        name: dto.name.trim(),
        slug,
        thumbnailUrl: dto.thumbnailUrl,
      })
      .returning();

    if (!created) {
      throw new NotFoundException('Unable to create category');
    }

    return created;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const slug = dto.slug ? this.toSlug(dto.slug) : dto.name ? this.toSlug(dto.name) : existing.slug;

    const [updated] = await this.db
      .update(categories)
      .set({
        name: dto.name?.trim() ?? existing.name,
        slug,
        thumbnailUrl: dto.thumbnailUrl ?? existing.thumbnailUrl,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated ?? existing;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!deleted) {
      throw new NotFoundException('Category not found');
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
