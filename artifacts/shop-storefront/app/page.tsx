"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { BookCard } from "@/components/book-card";
import { getBooks } from "@/components/book-data";
import { BookSkeletons, StatePanel } from "@/components/ui-states";
import { BOOK_CATEGORIES } from "@/lib/book-categories";
import type { BookSummary } from "@/lib/open-library";

export default function HomePage() {
  const [shelves, setShelves] = useState<Record<string, BookSummary[]>>({});
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setFailed(false);
    try {
      const entries = await Promise.all(BOOK_CATEGORIES.slice(0, 5).map(async (category) => {
        const result = await getBooks({ category: category.slug, page: 1, limit: 5 });
        return [category.slug, result.books] as const;
      }));
      setShelves(Object.fromEntries(entries));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">رفوف مفتوحة. عوالم لا تنتهي.</span>
          <h1>كل كتاب بداية<br />لحكاية <em>أبعد.</em></h1>
          <p>من الرواية التي تأخذك بعيداً، إلى فكرة تغيّر نظرتك للعالم. تصفّح مكتبة مفتوحة، وابحث عن الكتاب الذي يناديك.</p>
          <Link className="button-primary" href="/search">ابدأ رحلة الاكتشاف <ArrowLeft size={16} /></Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-book"><span className="hero-book-label">رفوف · مختارات</span><span className="hero-book-title">ما وراء<br />الصفحة</span><span className="hero-book-art" /><span className="hero-book-label">كتابك القادم ينتظرك</span></div>
          <div className="hero-floating one">حكايات من كل مكان</div><div className="hero-floating two">اقرأ على مهل</div>
        </div>
        <span className="hero-index">01 — 07 / DISCOVER</span>
      </section>

      <nav className="category-rail" aria-label="تصفح التصنيفات">
        {BOOK_CATEGORIES.map((category) => <Link className="category-chip" key={category.slug} href={`/category/${category.slug}`}>{category.label}</Link>)}
      </nav>

      {failed ? <StatePanel type="error" title="الرفوف تأخذ استراحة قصيرة" description="لم نتمكن من الوصول إلى كتالوج الكتب الآن. أعد المحاولة بعد لحظات." onRetry={() => void load()} /> : null}
      {BOOK_CATEGORIES.slice(0, 5).map((category, index) => (
        <section className="shelf" key={category.slug}>
          <div className="section-head">
            <div><span className="section-kicker">رف {String(index + 1).padStart(2, "0")} · {category.subject}</span><h2>{category.label} تستحق أن تُكتشف</h2></div>
            <Link className="text-link" href={`/category/${category.slug}`}>تصفّح الرف <ArrowLeft size={14} /></Link>
          </div>
          {loading ? <BookSkeletons count={5} /> : shelves[category.slug]?.length ? <div className="book-grid">{shelves[category.slug].map((book) => <BookCard book={book} key={book.id} />)}</div> : !failed ? <div className="shelf-empty">لا توجد عناوين ظاهرة في هذا الرف حالياً.</div> : null}
        </section>
      ))}

      <section className="promo-strip">
        <div><span className="section-kicker">فضولك هو الدليل</span><h2>لا تعرف ماذا تقرأ؟ ابدأ من موضوع تحبه.</h2><p>ابحث بين آلاف الكتب، واعثر على مؤلف أو فكرة لم تكن تعرف أنك تبحث عنها.</p></div>
        <Link className="promo-mark" href="/search"><Compass size={15} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 7 }} /> إلى فهرس الكتب</Link>
      </section>
    </main>
  );
}
