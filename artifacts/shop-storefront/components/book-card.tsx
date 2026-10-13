"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import type { BookSummary } from "@/lib/open-library";
import { cartEventName, isBookSaved, saveBook } from "@/components/cart-store";

const coverTones = ["#647c70", "#b36e51", "#596878", "#8c7a56", "#6b687d"];

export function BookCover({ book, large = false }: { book: Pick<BookSummary, "id" | "title" | "authors" | "coverUrl">; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [book.coverUrl]);
  return (
    <div className="cover-wrap">
      {book.coverUrl && !failed ? (
        // Open Library cover endpoint is the real catalog image source.
        <img src={book.coverUrl} alt={`غلاف ${book.title}`} loading={large ? "eager" : "lazy"} onError={() => setFailed(true)} />
      ) : (
        <div className="cover-missing" style={{ ["--cover-tone" as string]: coverTones[Math.abs(book.id.length + book.title.length) % coverTones.length] }}>
          <span>من رفوفنا</span><strong>{book.title}</strong><small>{book.authors[0] ?? "اسم المؤلف غير متاح"}</small>
        </div>
      )}
    </div>
  );
}

export function BookCard({ book }: { book: BookSummary }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const update = () => setSaved(isBookSaved(book.id));
    update();
    window.addEventListener(cartEventName(), update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartEventName(), update);
      window.removeEventListener("storage", update);
    };
  }, [book.id]);
  const query = searchParams.toString();
  const back = query ? `${pathname}?${query}` : pathname;
  return (
    <article className="book-card">
      <Link href={`/books/${book.id}?from=${encodeURIComponent(back)}`} aria-label={`عرض تفاصيل ${book.title}`}>
        <div className="cover-wrap">
          <BookCoverImage book={book} />
        </div>
      </Link>
      <button className={`save-book ${saved ? "saved" : ""}`} onClick={() => saveBook(book)} aria-label={saved ? "الكتاب محفوظ" : "احفظ الكتاب في قائمتي"} title={saved ? "محفوظ في قائمتك" : "أضف إلى قائمتي"}>
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
      <div className="book-meta">
        <Link href={`/books/${book.id}?from=${encodeURIComponent(back)}`}><h3>{book.title}</h3></Link>
        <div className="book-author">{book.authors.slice(0, 2).join("، ") || "مؤلف غير معروف"}</div>
        {book.firstPublishYear && <div className="book-year">{book.firstPublishYear}</div>}
      </div>
    </article>
  );
}

function BookCoverImage({ book }: { book: BookSummary }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [book.coverUrl]);
  if (!book.coverUrl || failed) {
    return <div className="cover-missing" style={{ ["--cover-tone" as string]: coverTones[Math.abs(book.id.length + book.title.length) % coverTones.length] }}>
      <span>من رفوفنا</span><strong>{book.title}</strong><small>{book.authors[0] ?? "اسم المؤلف غير متاح"}</small>
    </div>;
  }
  return <img src={book.coverUrl} alt={`غلاف ${book.title}`} loading="lazy" onError={() => setFailed(true)} />;
}
