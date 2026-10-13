import { BookOpen, RotateCcw } from "lucide-react";

export function BookSkeletons({ count = 5 }: { count?: number }) {
  return <div className="book-grid" aria-label="جارٍ تحميل الكتب">{Array.from({ length: count }, (_, index) => (
    <div className="book-card skeleton-card" key={index}>
      <div className="cover-wrap skeleton" />
      <div className="skeleton skeleton-line" style={{ width: "82%" }} />
      <div className="skeleton skeleton-line" style={{ width: "54%", marginTop: 8 }} />
    </div>
  ))}</div>;
}

export function StatePanel({ type, title, description, onRetry }: { type: "empty" | "error"; title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="state-panel">
      <div className="state-icon">{type === "error" ? <RotateCcw size={21} /> : <BookOpen size={21} />}</div>
      <h2>{title}</h2><p>{description}</p>
      {type === "error" && onRetry && <button className="retry-button" onClick={onRetry}>حاول مرة أخرى</button>}
    </div>
  );
}
