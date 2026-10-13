import Link from "next/link";
import { STORE_NAME } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <div><Link className="footer-brand" href="/">{STORE_NAME}</Link><div>نقرأ أكثر حين نجد ما يشبهنا.</div></div>
        <div className="footer-links">
          <Link href="/search">اكتشف الكتب</Link>
          <Link href="/cart">قائمة محفوظاتي</Link>
          <a href="https://openlibrary.org" target="_blank" rel="noreferrer">مصدر البيانات: Open Library</a>
        </div>
      </div>
    </footer>
  );
}
