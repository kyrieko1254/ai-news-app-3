'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  articles as articlesTable,
  categories as categoriesTable,
} from '@/db/schema';

type Category = typeof categoriesTable.$inferSelect;
type Article = typeof articlesTable.$inferSelect & {
  category: Category | null;
};

function formatDate(date: Date | string | null) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DashboardClient({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>(
    'all',
  );
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSummary, setFetchSummary] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [localArticles, setLocalArticles] = useState(articles);

  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  function handleArticleDeleted(articleId: number) {
    setLocalArticles((prev) =>
      prev.filter((article) => article.id !== articleId),
    );
  }

  function handleSearch() {
    setSearchKeyword(searchInput.trim());
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  async function handleFetchNews() {
    setIsFetching(true);
    setFetchError(null);
    setFetchSummary(null);
    try {
      const res = await fetch('/api/news/fetch', { method: 'POST' });
      if (!res.ok) {
        throw new Error('뉴스 가져오기에 실패했습니다.');
      }
      const result: { savedCount: number; skippedCount: number } =
        await res.json();
      setFetchSummary(
        `새 기사 ${result.savedCount}건 저장${result.skippedCount > 0 ? `, ${result.skippedCount}건 처리 실패로 건너뜀` : ''}`,
      );
      router.refresh();
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setIsFetching(false);
    }
  }

  const filteredArticles = useMemo(() => {
    let result = localArticles;
    if (selectedCategoryId !== 'all') {
      result = result.filter(
        (article) => article.categoryId === selectedCategoryId,
      );
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (article) =>
          article.titleKo.toLowerCase().includes(keyword) ||
          article.summaryKo.toLowerCase().includes(keyword),
      );
    }
    return result;
  }, [localArticles, selectedCategoryId, searchKeyword]);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 헤더 */}
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">
              AI 뉴스 수집기
            </h1>
            <span className="rounded-full bg-neutral-100 dark:bg-neutral-800/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              총 {localArticles.length}개의 뉴스
            </span>
          </div>
          <div className="flex items-center gap-3">
            {fetchError && (
              <span className="text-sm text-red-600">{fetchError}</span>
            )}
            {fetchSummary && !fetchError && (
              <span className="text-sm text-neutral-500">{fetchSummary}</span>
            )}
            <button
              type="button"
              onClick={handleFetchNews}
              disabled={isFetching}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isFetching ? '가져오는 중...' : '뉴스 가져오기'}
            </button>
          </div>
        </header>

        {/* 카테고리 바 + 키워드 검색 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={
                selectedCategoryId === 'all'
                  ? 'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white'
                  : 'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }
            >
              전체
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={
                  selectedCategoryId === category.id
                    ? 'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white'
                    : 'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }
              >
                {category.name}
              </button>
            ))}
            <button
              type="button"
              className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-indigo-500 hover:text-indigo-600"
            >
              <span aria-hidden="true">+</span> 카테고리 추가
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="키워드로 검색"
              className="w-48 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-800/60 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              검색
            </button>
          </div>
        </div>

        {/* 뉴스 카드 그리드 */}
        {filteredArticles.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">
            {searchKeyword
              ? `'${searchKeyword}'에 대한 검색 결과가 없습니다.`
              : selectedCategoryId === 'all'
                ? '저장된 뉴스가 없습니다.'
                : '이 카테고리에는 아직 뉴스가 없습니다.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onDeleted={handleArticleDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  onDeleted,
}: {
  article: Article;
  onDeleted: (articleId: number) => void;
}) {
  const router = useRouter();
  const [notionMessage, setNotionMessage] = useState<string | null>(null);
  const [isSavingToNotion, setIsSavingToNotion] = useState(false);
  const [notionSaved, setNotionSaved] = useState(article.notionSaved);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/news/${article.id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('삭제에 실패했습니다.');
      }
      onDeleted(article.id);
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      );
      setIsDeleting(false);
    }
  }

  async function handleNotionSave() {
    setIsSavingToNotion(true);
    setNotionMessage(null);
    try {
      const res = await fetch('/api/news/notion-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id }),
      });
      if (!res.ok) {
        throw new Error('Notion 저장에 실패했습니다.');
      }
      setNotionSaved(true);
      router.refresh();
    } catch (err) {
      setNotionMessage(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setIsSavingToNotion(false);
    }
  }

  return (
    <article className="relative flex flex-col gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="뉴스 삭제"
        title="삭제"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span aria-hidden="true">✕</span>
      </button>

      <div className="flex items-center justify-between gap-2 pr-6">
        <span className="rounded-full bg-neutral-100 dark:bg-neutral-800/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {article.category?.name ?? '미분류'}
        </span>
        <span className="shrink-0 text-xs text-neutral-500">
          {article.sourceName}
          {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ''}
        </span>
      </div>
      {deleteError && (
        <span className="text-xs text-red-600">{deleteError}</span>
      )}

      <h3 className="text-base font-semibold leading-snug text-foreground">
        {article.titleKo}
      </h3>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
        {article.summaryKo}
      </p>

      <div className="mt-1 flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          원문보기
        </a>
        <div className="ml-auto flex items-center gap-2">
          {notionMessage && (
            <span className="text-xs text-neutral-500">{notionMessage}</span>
          )}
          {notionSaved ? (
            <button
              type="button"
              disabled
              className="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed"
            >
              저장됨
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNotionSave}
              disabled={isSavingToNotion}
              className="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingToNotion ? '저장 중...' : 'Notion 저장'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
