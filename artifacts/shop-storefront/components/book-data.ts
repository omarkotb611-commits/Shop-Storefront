import type { BookSummary } from "@/lib/open-library";

export type SearchResponse = { books: BookSummary[]; total: number; page: number; limit: number; source: string };

export async function getBooks(params: { q?: string; category?: string; page?: number; limit?: number }): Promise<SearchResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 16));
  const response = await fetch(`/_book-api/books/search?${search.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "تعذّر تحميل الكتب الآن.");
  }
  return response.json();
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("ar").format(value);
}
