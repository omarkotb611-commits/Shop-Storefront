"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookCard } from "@/components/book-card";
import { formatCount, getBooks } from "@/components/book-data";
import type { SearchResponse } from "@/components/book-data";
import { BookSkeletons, StatePanel } from "@/components/ui-states";
import { BOOK_CATEGORIES } from "@/lib/book-categories";
import type { BookSummary } from "@/lib/open-library";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("category") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getBooks({ q: query, category: categorySlug || undefined, page, limit: 16 }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر تحميل النتائج.");
    } finally {
      setLoading(false);
    }
  }, [query, categorySlug, page]);

  useEffect(() => { void load(); }, [load]);

  function updateParams(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    router.push(`/search${next.size ? `?${next.toString()}` : ""}`);
  }

  const books = data?.books ?? [];
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 16)));

  return (
    <main className="page-shell">
      <div className="page-title">
        <div><span className="section-kicker">فهرس رفوف</span><h1>{query ? `نتائج البحث عن «${query}»` : "ابحث عمّا يحرّك فضولك"}</h1><p>عنوان، مؤلف، فكرة — ابدأ من أي خيط.</p></div>
      </div>
      <div className="search-layout">
        <aside className="filter-panel">
          <h2>ضيّق مجال البحث</h2>
          <label className="filter-label" htmlFor="category-filter">التصنيف</label>
          <select id="category-filter" className="filter-select" value={categorySlug} onChange={(event) => updateParams("category", event.target.value)}>
            <option value="">كل التصنيفات</option>{BOOK_CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}
          </select>
          {categorySlug && <button className="filter-reset" onClick={() => router.push(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`)}>مسح المحددات</button>}
        </aside>
        <section>
          <div className="results-topline"><span>{loading ? "نبحث بين الرفوف..." : `${formatCount(data?.total ?? 0)} عنوان في الفهرس`}</span><span>ترتيب حسب صلة البحث</span></div>
          {loading ? <BookSkeletons count={8} /> : error ? <StatePanel type="error" title="لم نصل إلى النتائج" description={error} onRetry={() => void load()} /> : books.length ? (
            <>
              <div className="results-grid">{books.map((book: BookSummary) => <BookCard key={book.id} book={book} />)}</div>
              {pageCount > 1 && <nav className="pagination" aria-label="صفحات النتائج">
                <button aria-label="السابق" disabled={page <= 1} onClick={() => updateParams("page", String(page - 1))}>‹</button>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, index) => {
                  const current = Math.min(Math.max(page - 2, 1), Math.max(pageCount - 4, 1)) + index;
                  return <button key={current} className={current === page ? "current" : ""} aria-current={current === page ? "page" : undefined} onClick={() => updateParams("page", String(current))}>{current}</button>;
                })}
                <button aria-label="التالي" disabled={page >= pageCount} onClick={() => updateParams("page", String(page + 1))}>›</button>
              </nav>}
            </>
          ) : <StatePanel type="empty" title="لم نجد ما يطابق هذا الخيط" description="جرّب كلمات مختلفة أو أزل بعض المحددات لتفتح مساحة أوسع للاكتشاف." />}
        </section>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<main className="page-shell"><div className="page-title"><div className="skeleton skeleton-line" style={{ width: 240, height: 34 }} /></div><BookSkeletons count={8} /></main>}><SearchContent /></Suspense>;
}
