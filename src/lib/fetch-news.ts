import Parser from 'rss-parser';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { articles, categories } from '@/db/schema';
import { RSS_SOURCES } from '@/lib/rss-sources';
import { classifyArticle } from '@/lib/claude-classify';

const parser = new Parser();

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type RawCandidate = {
  sourceUrl: string;
  sourceName: string;
  title: string;
  content: string;
  publishedAt: Date | null;
};

type ClassifiedCandidate = {
  sourceUrl: string;
  sourceName: string;
  titleKo: string;
  summaryKo: string;
  categoryName: string;
  publishedAt: Date | null;
};

// 등록된 RSS 소스에서 지난 24시간 이내 기사를 모아 신규 기사만 클로드 API로 번역/요약/분류 후 DB에 저장
export async function fetchAndSaveNews() {
  const since = Date.now() - ONE_DAY_MS;

  const feedResults = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return { source, items: feed.items };
    }),
  );

  const candidates: RawCandidate[] = [];
  for (const { source, items } of feedResults) {
    for (const item of items) {
      if (!item.link || !item.title) continue;

      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      if (!publishedAt || publishedAt.getTime() < since) continue;

      candidates.push({
        sourceUrl: item.link,
        sourceName: source.name,
        title: item.title,
        content: item.contentSnippet ?? item.content ?? '',
        publishedAt,
      });
    }
  }

  if (candidates.length === 0) {
    return { savedCount: 0, skippedCount: 0 };
  }

  const existingUrls = await db
    .select({ sourceUrl: articles.sourceUrl })
    .from(articles)
    .where(
      inArray(
        articles.sourceUrl,
        candidates.map((c) => c.sourceUrl),
      ),
    );
  const existingUrlSet = new Set(existingUrls.map((row) => row.sourceUrl));

  const newCandidates = candidates.filter((c) => !existingUrlSet.has(c.sourceUrl));
  if (newCandidates.length === 0) {
    return { savedCount: 0, skippedCount: 0 };
  }

  const existingCategories = await db.select({ name: categories.name }).from(categories);
  const existingCategoryNames = existingCategories.map((c) => c.name);

  const classified = await Promise.all(
    newCandidates.map(async (candidate) => {
      const result = await classifyArticle({
        title: candidate.title,
        content: candidate.content,
        existingCategories: existingCategoryNames,
      });
      if (!result) return null;
      const classifiedCandidate: ClassifiedCandidate = {
        sourceUrl: candidate.sourceUrl,
        sourceName: candidate.sourceName,
        titleKo: result.titleKo,
        summaryKo: result.summaryKo,
        categoryName: result.category,
        publishedAt: candidate.publishedAt,
      };
      return classifiedCandidate;
    }),
  );

  const successfulCandidates = classified.filter((c): c is ClassifiedCandidate => c !== null);
  const skippedCount = newCandidates.length - successfulCandidates.length;

  if (successfulCandidates.length === 0) {
    return { savedCount: 0, skippedCount };
  }

  const neededCategoryNames = [...new Set(successfulCandidates.map((c) => c.categoryName))];
  if (neededCategoryNames.length > 0) {
    await db
      .insert(categories)
      .values(neededCategoryNames.map((name) => ({ name })))
      .onConflictDoNothing({ target: categories.name });
  }

  const allCategories = await db.select().from(categories);
  const categoryIdByName = new Map(allCategories.map((c) => [c.name, c.id]));

  const inserted = await db
    .insert(articles)
    .values(
      successfulCandidates.map((c) => ({
        sourceUrl: c.sourceUrl,
        sourceName: c.sourceName,
        titleKo: c.titleKo,
        summaryKo: c.summaryKo,
        categoryId: categoryIdByName.get(c.categoryName) ?? null,
        publishedAt: c.publishedAt,
      })),
    )
    .onConflictDoNothing({ target: articles.sourceUrl })
    .returning({ id: articles.id });

  return { savedCount: inserted.length, skippedCount };
}
