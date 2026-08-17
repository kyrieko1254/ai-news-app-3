import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 카테고리 (클로드가 자동 제안하거나 사용자가 직접 CRUD 가능한 열린 목록)
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// 저장된 뉴스 기사 ("저장하기" 클릭 시점에만 기록됨)
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  sourceUrl: text('source_url').notNull().unique(), // 중복 판단 기준
  sourceName: text('source_name').notNull(),
  titleKo: text('title_ko').notNull(),
  summaryKo: text('summary_ko').notNull(),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  notionSaved: boolean('notion_saved').notNull().default(false), // DB 저장과 독립적으로 추적
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
}));
