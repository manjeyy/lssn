import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { DB, type typeDB } from '../db/db.provider';
import { lssnCategories, lssnTopics, lssns, slideReactions, slides } from '../db/schema';
import { Roles } from '../auth/enums/roles.enum';
import { CreateLssnDto } from './dto/create-lssn.dto';
import { UpdateLssnDto } from './dto/update-lssn.dto';

export type LssnStatus = 'draft' | 'published';

@Injectable()
export class LssnsService {
  constructor(@Inject(DB) private readonly db: any) {}

  async createLssn(ownerId: number, dto: CreateLssnDto) {
    const slidesCount = this.resolveSlidesCount(dto.content, dto.slidesCount);
    const status = dto.status ?? 'draft';
    const now = new Date();
    const tags = this.normalizeTags(dto.tags);

    const [created] = await this.db
      .insert(lssns)
      .values({
        ownerId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        thumbnailUrl: dto.thumbnailUrl,
        status,
        content: dto.content,
        tags,
        slidesCount,
        createdAt: now,
        updatedAt: now,
        publishedAt: status === 'published' ? now : null,
      })
      .returning();

    if (!created) {
      throw new NotFoundException('Unable to create LSSN');
    }

    await this.ensureSlides(created.id, slidesCount);
    await this.syncCategories(created.id, dto.categoryIds ?? []);
    await this.syncTopics(created.id, dto.topicIds ?? []);
    return this.withMeta(created);
  }

  async updateLssn(lssnId: number, userId: number, role: Roles, dto: UpdateLssnDto) {
    const lssn = await this.getLssnById(lssnId);
    this.assertOwnerOrAdmin(lssn.ownerId, userId, role);

    const content = dto.content ?? lssn.content;
    const slidesCount = this.resolveSlidesCount(content, dto.slidesCount ?? lssn.slidesCount);
    const status = (dto.status ?? lssn.status) as LssnStatus;
    const tags = dto.tags ? this.normalizeTags(dto.tags) : lssn.tags ?? [];

    const [updated] = await this.db
      .update(lssns)
      .set({
        title: dto.title?.trim() ?? lssn.title,
        description: dto.description?.trim() ?? lssn.description,
        thumbnailUrl: dto.thumbnailUrl ?? lssn.thumbnailUrl,
        status,
        content,
        tags,
        slidesCount,
        updatedAt: new Date(),
        publishedAt: status === 'published' && !lssn.publishedAt ? new Date() : lssn.publishedAt,
      })
      .where(eq(lssns.id, lssnId))
      .returning();

    if (!updated) {
      throw new NotFoundException('LSSN not found');
    }

    await this.syncSlides(lssnId, slidesCount);
    if (dto.categoryIds) {
      await this.syncCategories(lssnId, dto.categoryIds);
    }
    if (dto.topicIds) {
      await this.syncTopics(lssnId, dto.topicIds);
    }

    return this.withMeta(updated);
  }

  async deleteLssn(lssnId: number, userId: number, role: Roles) {
    const lssn = await this.getLssnById(lssnId);
    this.assertOwnerOrAdmin(lssn.ownerId, userId, role);

    const [deleted] = await this.db
      .delete(lssns)
      .where(eq(lssns.id, lssnId))
      .returning({ id: lssns.id });

    if (!deleted) {
      throw new NotFoundException('LSSN not found');
    }

    return { success: true };
  }

  async listPublished() {
    const records = await this.db.query.lssns.findMany({
      where: eq(lssns.status, 'published'),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
    return this.attachMeta(records);
  }

  async listAll() {
    const records = await this.db.query.lssns.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
    return this.attachMeta(records);
  }

  async listMine(userId: number) {
    const records = await this.db.query.lssns.findMany({
      where: eq(lssns.ownerId, userId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
    return this.attachMeta(records);
  }

  async getLssn(lssnId: number, userId: number, role: Roles) {
    const lssn = await this.getLssnById(lssnId);

    if (lssn.status !== 'published') {
      this.assertOwnerOrAdmin(lssn.ownerId, userId, role);
      return this.withMeta(lssn);
    }

    if (lssn.ownerId !== userId) {
      const [updated] = await this.db
        .update(lssns)
        .set({ views: sql`${lssns.views} + 1` })
        .where(eq(lssns.id, lssnId))
        .returning();

      return this.withMeta(updated ?? lssn);
    }

    return this.withMeta(lssn);
  }

  async statsForUser(userId: number) {
    const records = await this.db.query.lssns.findMany({
      where: eq(lssns.ownerId, userId),
      columns: {
        views: true,
        likesCount: true,
        rating: true,
      },
    });

    const totalViews = records.reduce((sum, row) => sum + row.views, 0);
    const totalLikes = records.reduce((sum, row) => sum + row.likesCount, 0);
    const totalLssns = records.length;
    const ratings = records
      .map((row) => Number(row.rating))
      .filter((value) => value > 0);
    const avgRating = ratings.length
      ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1))
      : 0;

    return {
      totalViews,
      totalLikes,
      totalLssns,
      avgRating,
    };
  }

  async reactToSlide(lssnId: number, slideIndex: number, userId: number, reaction: 'like' | 'dislike') {
    return this.db.transaction(async (tx) => {
      const lssn = await tx.query.lssns.findFirst({ where: eq(lssns.id, lssnId) });
      if (!lssn || lssn.status !== 'published') {
        throw new NotFoundException('Published LSSN not found');
      }

      const slide = await tx.query.slides.findFirst({
        where: and(eq(slides.lssnId, lssnId), eq(slides.slideIndex, slideIndex)),
      });

      if (!slide) {
        throw new NotFoundException('Slide not found');
      }

      const existing = await tx.query.slideReactions.findFirst({
        where: and(
          eq(slideReactions.lssnId, lssnId),
          eq(slideReactions.slideIndex, slideIndex),
          eq(slideReactions.userId, userId),
        ),
      });

      let deltaLikes = 0;
      let deltaDislikes = 0;

      if (!existing) {
        await tx.insert(slideReactions).values({
          lssnId,
          slideIndex,
          userId,
          reaction,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        deltaLikes = reaction === 'like' ? 1 : 0;
        deltaDislikes = reaction === 'dislike' ? 1 : 0;
      } else if (existing.reaction === reaction) {
        await tx.delete(slideReactions).where(eq(slideReactions.id, existing.id));
        deltaLikes = reaction === 'like' ? -1 : 0;
        deltaDislikes = reaction === 'dislike' ? -1 : 0;
      } else {
        await tx
          .update(slideReactions)
          .set({ reaction, updatedAt: new Date() })
          .where(eq(slideReactions.id, existing.id));
        deltaLikes = reaction === 'like' ? 1 : -1;
        deltaDislikes = reaction === 'dislike' ? 1 : -1;
      }

      const nextSlideLikes = Math.max(0, slide.likesCount + deltaLikes);
      const nextSlideDislikes = Math.max(0, slide.dislikesCount + deltaDislikes);

      await tx
        .update(slides)
        .set({
          likesCount: nextSlideLikes,
          dislikesCount: nextSlideDislikes,
        })
        .where(eq(slides.id, slide.id));

      const nextLikes = Math.max(0, lssn.likesCount + deltaLikes);
      const nextDislikes = Math.max(0, lssn.dislikesCount + deltaDislikes);
      const total = nextLikes + nextDislikes;
      const rating = total > 0 ? (nextLikes / total) * 100 : 0;

      const [updatedLssn] = await tx
        .update(lssns)
        .set({
          likesCount: nextLikes,
          dislikesCount: nextDislikes,
          rating: rating.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(lssns.id, lssnId))
        .returning();

      return {
        slide: {
          likes: nextSlideLikes,
          dislikes: nextSlideDislikes,
        },
        lssn: {
          likes: nextLikes,
          dislikes: nextDislikes,
          rating: Number(updatedLssn?.rating ?? rating.toFixed(2)),
        },
      };
    });
  }

  private async getLssnById(lssnId: number) {
    const lssn = await this.db.query.lssns.findFirst({ where: eq(lssns.id, lssnId) });
    if (!lssn) {
      throw new NotFoundException('LSSN not found');
    }
    return lssn;
  }

  private async withMeta(lssn: any) {
    const [categoryRows, topicRows] = await Promise.all([
      this.db
        .select({ categoryId: lssnCategories.categoryId })
        .from(lssnCategories)
        .where(eq(lssnCategories.lssnId, lssn.id)),
      this.db
        .select({ topicId: lssnTopics.topicId })
        .from(lssnTopics)
        .where(eq(lssnTopics.lssnId, lssn.id)),
    ]);

    return {
      ...lssn,
      categoryIds: categoryRows.map((row) => row.categoryId),
      topicIds: topicRows.map((row) => row.topicId),
    };
  }

  private async attachMeta(records: any[]) {
    if (records.length === 0) {
      return records;
    }

    const lssnIds = records.map((record) => record.id);
    const [categoryRows, topicRows] = await Promise.all([
      this.db
        .select({ lssnId: lssnCategories.lssnId, categoryId: lssnCategories.categoryId })
        .from(lssnCategories)
        .where(inArray(lssnCategories.lssnId, lssnIds)),
      this.db
        .select({ lssnId: lssnTopics.lssnId, topicId: lssnTopics.topicId })
        .from(lssnTopics)
        .where(inArray(lssnTopics.lssnId, lssnIds)),
    ]);

    const categoryMap = new Map<number, number[]>();
    const topicMap = new Map<number, number[]>();

    categoryRows.forEach((row) => {
      const list = categoryMap.get(row.lssnId) ?? [];
      list.push(row.categoryId);
      categoryMap.set(row.lssnId, list);
    });

    topicRows.forEach((row) => {
      const list = topicMap.get(row.lssnId) ?? [];
      list.push(row.topicId);
      topicMap.set(row.lssnId, list);
    });

    return records.map((record) => ({
      ...record,
      categoryIds: categoryMap.get(record.id) ?? [],
      topicIds: topicMap.get(record.id) ?? [],
    }));
  }

  private assertOwnerOrAdmin(ownerId: number, userId: number, role: Roles) {
    if (ownerId !== userId && role !== Roles.Admin) {
      throw new ForbiddenException('You do not have access to this LSSN');
    }
  }

  private resolveSlidesCount(content: unknown, fallback?: number): number {
    if (typeof fallback === 'number') {
      return Math.max(0, fallback);
    }

    if (content && typeof content === 'object') {
      const data = content as Record<string, unknown>;
      if (Array.isArray(data.slides)) {
        return data.slides.length;
      }
      if (data.cardsData && typeof data.cardsData === 'object') {
        return Object.keys(data.cardsData as Record<string, unknown>).length;
      }
      if (Array.isArray(data.items)) {
        return data.items.length;
      }
    }

    return 0;
  }

  private async ensureSlides(lssnId: number, slidesCount: number) {
    if (slidesCount <= 0) {
      return;
    }

    const rows = Array.from({ length: slidesCount }, (_, index) => ({
      lssnId,
      slideIndex: index,
    }));

    await this.db
      .insert(slides)
      .values(rows)
      .onConflictDoNothing({ target: [slides.lssnId, slides.slideIndex] });
  }

  private async syncSlides(lssnId: number, slidesCount: number) {
    const existing = await this.db.query.slides.findMany({
      where: eq(slides.lssnId, lssnId),
      columns: { slideIndex: true },
    });

    const existingIndexes = new Set(existing.map((row) => row.slideIndex));
    const desiredIndexes = new Set(Array.from({ length: slidesCount }, (_, index) => index));

    const toCreate = Array.from(desiredIndexes).filter((index) => !existingIndexes.has(index));
    if (toCreate.length > 0) {
      await this.db
        .insert(slides)
        .values(toCreate.map((slideIndex) => ({ lssnId, slideIndex })))
        .onConflictDoNothing();
    }

    const toDelete = Array.from(existingIndexes).filter((index) => !desiredIndexes.has(index as any));
    if (toDelete.length > 0) {
      await this.db
        .delete(slides)
        .where(and(eq(slides.lssnId, lssnId), inArray(slides.slideIndex, toDelete as any)));

      await this.db
        .delete(slideReactions)
        .where(and(eq(slideReactions.lssnId, lssnId), inArray(slideReactions.slideIndex, toDelete as any)));
    }
  }

  private async syncCategories(lssnId: number, categoryIds: number[]) {
    const uniqueIds = Array.from(new Set(categoryIds));
    if (uniqueIds.length === 0) {
      await this.db.delete(lssnCategories).where(eq(lssnCategories.lssnId, lssnId));
      return;
    }

    const existing = await this.db
      .select({ categoryId: lssnCategories.categoryId })
      .from(lssnCategories)
      .where(eq(lssnCategories.lssnId, lssnId));

    const existingIds = new Set(existing.map((row) => row.categoryId));
    const toAdd = uniqueIds.filter((id) => !existingIds.has(id as any));
    const toRemove = Array.from(existingIds).filter((id) => !uniqueIds.includes(id as any));

    if (toAdd.length > 0) {
      await this.db.insert(lssnCategories).values(
        toAdd.map((categoryId) => ({ lssnId, categoryId })),
      ).onConflictDoNothing();
    }

    if (toRemove.length > 0) {
      await this.db
        .delete(lssnCategories)
        .where(and(eq(lssnCategories.lssnId, lssnId), inArray(lssnCategories.categoryId, toRemove as any)));
    }
  }

  private async syncTopics(lssnId: number, topicIds: number[]) {
    const uniqueIds = Array.from(new Set(topicIds));
    if (uniqueIds.length === 0) {
      await this.db.delete(lssnTopics).where(eq(lssnTopics.lssnId, lssnId));
      return;
    }

    const existing = await this.db
      .select({ topicId: lssnTopics.topicId })
      .from(lssnTopics)
      .where(eq(lssnTopics.lssnId, lssnId));

    const existingIds = new Set(existing.map((row) => row.topicId));
    const toAdd = uniqueIds.filter((id) => !existingIds.has(id as any));
    const toRemove = Array.from(existingIds).filter((id) => !uniqueIds.includes(id as any));

    if (toAdd.length > 0) {
      await this.db.insert(lssnTopics).values(
        toAdd.map((topicId) => ({ lssnId, topicId })),
      ).onConflictDoNothing();
    }

    if (toRemove.length > 0) {
      await this.db
        .delete(lssnTopics)
        .where(and(eq(lssnTopics.lssnId, lssnId), inArray(lssnTopics.topicId, toRemove as any)));
    }
  }

  private normalizeTags(tags?: string[]) {
    if (!tags) {
      return [] as string[];
    }
    const cleaned = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    return Array.from(new Set(cleaned));
  }
}
