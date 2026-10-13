"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { formatCount, getBooks } from "@/components/book-data";
import type { SearchResponse } from "@/components/book-data";
import { BookSkeletons, StatePanel } from "@/components/ui-states";
import { BOOK_CATEGORIES } from "@/lib/book-categories";

function CategoryContent() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const category = BOOK_CATEGORIES.find((item) => item.slug === slug);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!category) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setData(await getBooks({ category: category.slug, page, limit: 20 })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "تعذّر تحميل هذا التصنيف."); }
    finally { setLoading(false); }
  }, [category, page]);
  useEffect(() => { void load(); }, [load]);
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));

  if (!category) return <main className="page-shell"><StatePanel type="empty" title="هذا الرف غير موجود" description="اختر تصنيفاً آخر من رفوف المكتبة." /><Link href="/" className="text-link">العودة للرئيسية <ArrowLeft size={14} /></Link></main>;
  return (
    <main className="page-shell">
      <div className="page-title"><div><span className="section-kicker">رف موضوعي · {category.subject}</span><h1>{category.label}</h1><p>تصفّح العناوين، واترك فضولك يختار طريقه.</p></div></div>
      {loading ? <BookSkeletons count={10} /> : error ? <StatePanel type="error" title="الرف لم يفتح بعد" description={error} onRetry={() => void load()} /> : data?.books.length ? <>
        <div className="results-topline"><span>{formatCount(data.total)} عنوان</span><Link className="text-link" href={`/search?category=${category.slug}`}>ابحث داخل هذا الرف <ArrowLeft size={13} /></Link></div>
        <div className="results-grid">{data.books.map((book) => <BookCard key={book.id} book={book} />)}</div>
        {pages > 1 && <nav className="pagination" aria-label="صفحات التصنيف">
          <button disabled={page <= 1} onClick={() => router.push(`/category/${slug}?page=${page - 1}`)}>‹</button>
          <span style={{ alignSelf: "center", paddingInline: 8, color: "var(--muted)", fontSize: 12 }}>صفحة {page} من {pages}</span>
          <button disabled={page >= pages} onClick={() => router.push(`/category/${slug}?page=${page + 1}`)}>›</button>
        </nav>}
      </> : <StatePanel type="empty" title="هذا الرف هادئ الآن" description="لم تظهر عناوين لهذا التصنيف. جرّب رفاً آخر أو تصفح كل الكتب." />}
    </main>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={<main className="page-shell"><div className="page-title"><div className="skeleton skeleton-line" style={{ width: 220, height: 34 }} /></div><BookSkeletons count={10} /></main>}><CategoryContent /></Suspense>;
}
