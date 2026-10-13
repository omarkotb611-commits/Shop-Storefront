export type BookCategory = {
  slug: string;
  label: string;
  subject: string;
  language?: string;
};

export const BOOK_CATEGORIES: readonly BookCategory[] = [
  { slug: "novels", label: "روايات", subject: "fiction" },
  {
    slug: "arabic-literature",
    label: "أدب عربي",
    subject: "arabic fiction",
    language: "ara",
  },
  { slug: "history", label: "تاريخ", subject: "history" },
  { slug: "science", label: "علوم", subject: "science" },
  { slug: "philosophy", label: "فلسفة", subject: "philosophy" },
  { slug: "children", label: "كتب الأطفال", subject: "juvenile fiction" },
  { slug: "self-help", label: "تطوير الذات", subject: "self-help" },
] as const;

export function findBookCategory(slug: string) {
  return BOOK_CATEGORIES.find((category) => category.slug === slug);
}
