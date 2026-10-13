export type BookSummary = {
  id: string;
  title: string;
  authors: string[];
  firstPublishYear: number | null;
  editionCount: number | null;
  coverId: number | null;
  coverUrl: string | null;
  subjects: string[];
  languages: string[];
  publishers: string[];
  isbns: string[];
  pageCount: number | null;
  averageRating: number | null;
  ratingCount: number | null;
  openLibraryUrl: string;
};

export type BookEdition = {
  id: string | null;
  title: string | null;
  publishers: string[];
  publishDate: string | null;
  isbns: string[];
  pageCount: number | null;
  languages: string[];
  format: string | null;
  coverId: number | null;
};

export type BookDetails = BookSummary & {
  description: string | null;
  firstPublishDate: string | null;
  authors: string[];
  editions: BookEdition[];
  subjectPlaces: string[];
  subjectTimes: string[];
};

type SearchDocument = {
  key?: unknown;
  title?: unknown;
  author_name?: unknown;
  first_publish_year?: unknown;
  edition_count?: unknown;
  cover_i?: unknown;
  subject?: unknown;
  language?: unknown;
  publisher?: unknown;
  isbn?: unknown;
  number_of_pages_median?: unknown;
  ratings_average?: unknown;
  ratings_count?: unknown;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function getCoverUrl(coverId: number | null, size: "M" | "L" = "M") {
  return coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`
    : null;
}

export function normalizeSearchDocument(doc: SearchDocument): BookSummary | null {
  if (typeof doc.key !== "string" || typeof doc.title !== "string") return null;

  const id = doc.key.split("/").filter(Boolean).at(-1);
  if (!id || !/^OL\d+W$/.test(id)) return null;

  const coverId = finiteNumber(doc.cover_i);

  return {
    id,
    title: doc.title,
    authors: stringArray(doc.author_name),
    firstPublishYear: finiteNumber(doc.first_publish_year),
    editionCount: finiteNumber(doc.edition_count),
    coverId,
    coverUrl: getCoverUrl(coverId),
    subjects: stringArray(doc.subject).slice(0, 8),
    languages: stringArray(doc.language).slice(0, 6),
    publishers: stringArray(doc.publisher).slice(0, 4),
    isbns: stringArray(doc.isbn).slice(0, 4),
    pageCount: finiteNumber(doc.number_of_pages_median),
    averageRating: finiteNumber(doc.ratings_average),
    ratingCount: finiteNumber(doc.ratings_count),
    openLibraryUrl: `https://openlibrary.org/works/${id}`,
  };
}

export function toDescription(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return value.value;
  }
  return null;
}
