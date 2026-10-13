"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Star } from "lucide-react";
import { BookCover } from "@/components/book-card";
import { cartEventName, isBookSaved, saveBook } from "@/components/cart-store";
import { StatePanel } from "@/components/ui-states";
import type { BookDetails } from "@/lib/open-library";

function BookDetailsContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const requestedFrom = searchParams.get("from") || "/";
  const from = requestedFrom.startsWith("/") && !requestedFrom.startsWith("//") ? requestedFrom : "/";
  const [book, setBook] = useState<BookDetails | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/_book-api/books/${encodeURIComponent(id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "تعذّر تحميل بيانات الكتاب.");
      setBook(data.book as BookDetails);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذّر تحميل بيانات الكتاب.");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const update = () => setSaved(isBookSaved(id));
    update();
    window.addEventListener(cartEventName(), update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartEventName(), update);
      window.removeEventListener("storage", update);
    };
  }, [id]);

  if (loading) return <main className="page-shell detail-page"><div className="detail-layout"><div className="skeleton" style={{ height: 410 }} /><div><div className="skeleton skeleton-line" style={{ width: "38%", height: 15 }} /><div className="skeleton skeleton-line" style={{ width: "72%", height: 35, marginTop: 23 }} /><div className="skeleton skeleton-line" style={{ width: "48%", marginTop: 20 }} /><div className="skeleton skeleton-line" style={{ width: "95%", height: 90, marginTop: 30 }} /></div></div></main>;
  if (error || !book) return <main className="page-shell detail-page"><StatePanel type="error" title="لم نتمكن من فتح بطاقة الكتاب" description={error || "الكتاب غير متاح حالياً."} onRetry={() => void load()} /><Link className="text-link" href={from}>العودة إلى نتائجك <ArrowLeft size={14} /></Link></main>;

  const summary = book.description?.trim() || "لا تتوفر نبذة موثقة لهذا الكتاب في الفهرس حتى الآن. يمكنك الاطلاع على بيانات الطبعات والموضوعات المرتبطة به.";
  return (
    <main className="page-shell detail-page">
      <nav className="breadcrumbs" aria-label="مسار التنقل">
        <Link href="/">الرئيسية</Link><span>/</span><Link href={from}>العودة إلى التصفح</Link><span>/</span><span>{book.title}</span>
      </nav>
      <section className="detail-layout">
        <div className="detail-cover"><BookCover book={book} large /></div>
        <div className="detail-info">
          <span className="section-kicker">بطاقة من فهرس رفوف</span>
          <h1>{book.title}</h1>
          <div className="detail-author">{book.authors.join("، ") || "اسم المؤلف غير متاح"}</div>
          <div className="rating-line"><Star className="rating-star" size={16} fill="currentColor" /><strong>{book.averageRating?.toFixed(1) ?? "—"}</strong><span>{book.ratingCount ? `من ${new Intl.NumberFormat("ar").format(book.ratingCount)} تقييم` : "لا توجد تقييمات مسجلة"}</span></div>
          <p className="detail-description">{summary}</p>
          <div className="detail-actions">
            <button className="button-solid" onClick={() => saveBook(book)}>{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? "أُضيف إلى قائمتك" : "أضف إلى قائمتي"}</button>
            <a className="button-outline" href={book.openLibraryUrl} target="_blank" rel="noreferrer">المصدر الأصلي <ExternalLink size={14} /></a>
          </div>
          <div className="facts-grid">
            <div className="fact"><span>سنة النشر الأولى</span><strong>{book.firstPublishDate || book.firstPublishYear || "غير متاح"}</strong></div>
            <div className="fact"><span>الطبعات المسجلة</span><strong>{book.editionCount ?? "—"}</strong></div>
            <div className="fact"><span>عدد الصفحات</span><strong>{book.pageCount ? `${book.pageCount} ص` : "غير متاح"}</strong></div>
            <div className="fact"><span>الناشر</span><strong>{book.publishers[0] || "غير متاح"}</strong></div>
            <div className="fact"><span>اللغات</span><strong>{book.languages.slice(0, 3).join("، ") || "غير محددة"}</strong></div>
            <div className="fact"><span>رقم ISBN</span><strong>{book.isbns[0] || "غير متاح"}</strong></div>
          </div>
        </div>
      </section>

      {!!book.subjects.length && <section className="detail-section"><h2>موضوعات الكتاب</h2><div className="tag-list">{book.subjects.map((subject) => <span className="tag" key={subject}>{subject}</span>)}</div></section>}
      {!!(book.subjectPlaces.length || book.subjectTimes.length) && <section className="detail-section">
        <h2>سياق الحكاية</h2>
        {book.subjectPlaces.length > 0 && <><span className="filter-label">أماكن مرتبطة</span><div className="tag-list">{book.subjectPlaces.map((place) => <span className="tag" key={place}>{place}</span>)}</div></>}
        {book.subjectTimes.length > 0 && <><span className="filter-label">أزمنة مرتبطة</span><div className="tag-list">{book.subjectTimes.map((time) => <span className="tag" key={time}>{time}</span>)}</div></>}
      </section>}
      {!!book.editions.length && <section className="detail-section"><h2>طبعات في الفهرس</h2><div className="edition-list">
        {book.editions.map((edition, index) => <div className="edition-row" key={edition.id ?? `${edition.title}-${index}`}><strong>{edition.title || "طبعة مسجلة"}</strong><span>{edition.publishers[0] || "ناشر غير متاح"}{edition.publishDate ? ` · ${edition.publishDate}` : ""}{edition.pageCount ? ` · ${edition.pageCount} صفحة` : ""}</span></div>)}
      </div></section>}
    </main>
  );
}

export default function BookDetailsPage() {
  return <Suspense fallback={<main className="page-shell detail-page"><div className="skeleton" style={{ height: 420 }} /></main>}><BookDetailsContent /></Suspense>;
}
