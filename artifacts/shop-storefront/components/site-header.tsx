"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { cartEventName, readSavedBooks } from "@/components/cart-store";
import { STORE_NAME } from "@/components/brand";
import { BOOK_CATEGORIES } from "@/lib/book-categories";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const update = () => setCount(readSavedBooks().length);
    update();
    window.addEventListener(cartEventName(), update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(cartEventName(), update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <>
      <div className="topbar">مساحة مفتوحة لاكتشاف كتابك القادم · كل العناوين من مكتبة Open Library</div>
      <header className="site-header">
        <div className="page-shell header-inner">
          <Link className="brand" href="/" aria-label={`${STORE_NAME} - الصفحة الرئيسية`}>
            <span className="brand-mark">{STORE_NAME.slice(0, 1)}</span>
            <span><span className="brand-name">{STORE_NAME}</span><small className="brand-note">مكتبة الاكتشاف</small></span>
          </Link>
          <nav className="main-nav" aria-label="التصنيفات">
            <Link className={pathname === "/" ? "active" : ""} href="/">الرئيسية</Link>
            {BOOK_CATEGORIES.slice(0, 4).map((category) => (
              <Link key={category.slug} className={pathname === `/category/${category.slug}` ? "active" : ""} href={`/category/${category.slug}`}>
                {category.label}
              </Link>
            ))}
          </nav>
          <form className="header-search search-form" onSubmit={submitSearch} role="search">
            <button aria-label="ابحث" type="submit"><Search size={17} /></button>
            <input aria-label="ابحث عن كتاب أو مؤلف" placeholder="ابحث عن كتاب أو مؤلف..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </form>
          <Link className="cart-link" href="/cart" aria-label={`قائمة الكتب المحفوظة، ${count} كتاب`}>
            <ShoppingBag size={18} />
            {count > 0 && <span className="cart-count">{count > 99 ? "99+" : count}</span>}
          </Link>
        </div>
        <div className="page-shell category-rail" aria-label="كل التصنيفات">
          {BOOK_CATEGORIES.map((category) => (
            <Link key={category.slug} className={`category-chip ${pathname === `/category/${category.slug}` ? "selected" : ""}`} href={`/category/${category.slug}`}>
              {category.label}
            </Link>
          ))}
          <Link className="category-chip" href="/search">كل الكتب <ArrowLeft size={13} style={{ display: "inline", verticalAlign: "middle", marginInlineStart: 4 }} /></Link>
        </div>
      </header>
    </>
  );
}
