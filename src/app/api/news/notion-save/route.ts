import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { articles, categories } from '@/db/schema';
import { saveArticleToNotion } from '@/lib/notion';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const articleId = body?.articleId;
  if (typeof articleId !== 'number') {
    return NextResponse.json({ error: 'articleId가 필요합니다.' }, { status: 400 });
  }

  const [article] = await db
    .select({
      id: articles.id,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      sourceUrl: articles.sourceUrl,
      sourceName: articles.sourceName,
      publishedAt: articles.publishedAt,
      notionSaved: articles.notionSaved,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, articleId));

  if (!article) {
    return NextResponse.json({ error: '기사를 찾을 수 없습니다.' }, { status: 404 });
  }

  if (article.notionSaved) {
    return NextResponse.json({ notionSaved: true });
  }

  try {
    await saveArticleToNotion({
      titleKo: article.titleKo,
      summaryKo: article.summaryKo,
      sourceUrl: article.sourceUrl,
      sourceName: article.sourceName,
      categoryName: article.categoryName,
      publishedAt: article.publishedAt,
    });
  } catch {
    return NextResponse.json({ error: 'Notion 저장에 실패했습니다.' }, { status: 502 });
  }

  await db.update(articles).set({ notionSaved: true }).where(eq(articles.id, articleId));

  return NextResponse.json({ notionSaved: true });
}
