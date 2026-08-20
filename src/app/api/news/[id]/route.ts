import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { articles } from '@/db/schema';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    return NextResponse.json({ error: '유효하지 않은 articleId입니다.' }, { status: 400 });
  }

  let deleted;
  try {
    [deleted] = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning({ id: articles.id });
  } catch {
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }

  if (!deleted) {
    return NextResponse.json({ error: '기사를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
