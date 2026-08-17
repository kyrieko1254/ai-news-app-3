import { desc } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [articleRows, categoryRows] = await Promise.all([
    db.query.articles.findMany({
      orderBy: desc(articles.createdAt),
      with: {
        category: true,
      },
    }),
    db.select().from(categories).orderBy(categories.name),
  ]);

  return <DashboardClient articles={articleRows} categories={categoryRows} />;
}
