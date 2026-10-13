"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import { BookCover } from "@/components/book-card";
import { readSavedBooks, removeSavedBook, cartEventName, type SavedBook } from "@/components/cart-store";
import { StatePanel } from "@/components/ui-states";

export default function CartPage() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  useEffect(() => {
    const update = () => setBooks(readSavedBooks());
    update();
    window.addEventListener(cartEventName(), update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartEventName(), update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <main className="page-shell cart-page">
      <div className="page-title"><div><span className="section-kicker">رفّك الشخصي</span><h1>كتب تستحق أن تعود إليها</h1><p>احفظ العناوين التي لفتت انتباهك، وقائمة اختياراتك تبقى على هذا الجهاز.</p></div></div>
      {books.length ? <>
        <div className="results-topline"><span>{new Intl.NumberFormat("ar").format(books.length)} كتاب محفوظ</span><Link className="text-link" href="/search">أضف اكتشافاً جديداً <ArrowLeft size={14} /></Link></div>
        {books.map((book) => <article className="cart-row" key={book.id}>
          <Link href={`/books/${book.id}?from=%2Fcart`} aria-label={`تفاصيل ${book.title}`}><BookCover book={book} /></Link>
          <div><Link href={`/books/${book.id}?from=%2Fcart`}><h2 className="cart-row-title">{book.title}</h2></Link><div className="cart-row-author">{book.authors.join("، ") || "مؤلف غير معروف"}{book.firstPublishYear ? ` · ${book.firstPublishYear}` : ""}</div></div>
          <button className="remove-button" onClick={() => removeSavedBook(book.id)} aria-label={`إزالة ${book.title}`}><Trash2 size={15} /><span>إزالة</span></button>
        </article>)}
        <div className="cart-note"><Bookmark size={14} style={{ display: "inline", verticalAlign: "middle", marginInlineEnd: 6 }} /> هذه قائمة قراءة محفوظة على جهازك فقط؛ رفوف ليست متجر دفع أو شراء.</div>
      </> : <StatePanel type="empty" title="رفّك ما زال ينتظر أول كتاب" description="أثناء التصفح، اضغط علامة الحفظ على أي غلاف ليبقى هنا. قائمتك خاصة بهذا الجهاز." />}
    </main>
  );
}
