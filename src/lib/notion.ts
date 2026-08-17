import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// "저장하기"(DB 저장)와 독립적으로, 기사 한 건을 Notion 데이터베이스에 페이지로 저장
export async function saveArticleToNotion(article: {
  titleKo: string;
  summaryKo: string;
  sourceUrl: string;
  sourceName: string;
  categoryName: string | null;
  publishedAt: Date | null;
}) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.');
  }

  const summaryWithMeta = [article.summaryKo, `(출처: ${article.sourceName})`].join('\n\n');

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      제목: {
        title: [{ text: { content: article.titleKo } }],
      },
      출처: {
        url: article.sourceUrl,
      },
      요약: {
        rich_text: [{ text: { content: summaryWithMeta } }],
      },
      ...(article.categoryName
        ? { 카테고리: { rich_text: [{ text: { content: article.categoryName } }] } }
        : {}),
      ...(article.publishedAt
        ? { 날짜: { date: { start: article.publishedAt.toISOString().slice(0, 10) } } }
        : {}),
    },
  });
}
