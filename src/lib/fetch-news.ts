import Parser from 'rss-parser';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { articles } from '@/db/schema';
import { RSS_SOURCES } from '@/lib/rss-sources';

const parser = new Parser();

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Candidate = {
  sourceUrl: string;
  sourceName: string;
  titleKo: string;
  summaryKo: string;
  publishedAt: Date | null;
};

// 등록된 RSS 소스에서 지난 24시간 이내 기사를 모아 신규 기사만 DB에 저장
export async function fetchAndSaveNews() {
  const since = Date.now() - ONE_DAY_MS;

  const feedResults = await Promise.all(
    RSS_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return { source, items: feed.items };
    }),
  );

  const candidates: Candidate[] = [];
  for (const { source, items } of feedResults) {
    for (const item of items) {
      if (!item.link || !item.title) continue;

      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      if (!publishedAt || publishedAt.getTime() < since) continue;

      candidates.push({
        sourceUrl: item.link,
        sourceName: source.name,
        titleKo: item.title,
        summaryKo: item.contentSnippet ?? item.content ?? '',
        publishedAt,
      });
    }
  }

  if (candidates.length === 0) {
    return { savedCount: 0 };
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
    return { savedCount: 0 };
  }

  const inserted = await db
    .insert(articles)
    .values(newCandidates)
    .onConflictDoNothing({ target: articles.sourceUrl })
    .returning({ id: articles.id });

  return { savedCount: inserted.length };
}
