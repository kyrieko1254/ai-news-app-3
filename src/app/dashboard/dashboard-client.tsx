"use client";

import { useMemo, useState } from "react";
import type { articles as articlesTable, categories as categoriesTable } from "@/db/schema";

type Category = typeof categoriesTable.$inferSelect;
type Article = typeof articlesTable.$inferSelect & {
  category: Category | null;
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardClient({
  articles,
  categories,
}: {
  articles: Article[];
  categories: Category[];
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");

  const filteredArticles = useMemo(() => {
    if (selectedCategoryId === "all") return articles;
    return articles.filter((article) => article.categoryId === selectedCategoryId);
  }, [articles, selectedCategoryId]);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 헤더 */}
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h1 className="text-xl font-semibold text-foreground">AI 뉴스 수집기</h1>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            뉴스 가져오기
          </button>
        </header>

        {/* 카테고리 바 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={
              selectedCategoryId === "all"
                ? "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white"
                : "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
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
                  ? "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white"
                  : "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
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

        {/* 뉴스 카드 그리드 */}
        {filteredArticles.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">
            {selectedCategoryId === "all"
              ? "저장된 뉴스가 없습니다."
              : "이 카테고리에는 아직 뉴스가 없습니다."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-neutral-100 dark:bg-neutral-800/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {article.category?.name ?? "미분류"}
        </span>
        <span className="shrink-0 text-xs text-neutral-500">
          {article.sourceName}
          {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ""}
        </span>
      </div>

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
          <button
            type="button"
            disabled
            className="rounded-md px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed"
          >
            저장됨
          </button>
          {article.notionSaved ? (
            <button
              type="button"
              disabled
              className="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-200 dark:border-neutral-800 text-green-600 dark:text-green-500 cursor-not-allowed"
            >
              Notion 저장됨
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Notion 저장
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
