import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fetchAndSaveNews } from '@/lib/fetch-news';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchAndSaveNews();
  return NextResponse.json(result);
}
