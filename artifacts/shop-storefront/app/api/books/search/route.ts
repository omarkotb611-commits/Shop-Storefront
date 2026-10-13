import { NextResponse } from "next/server";
import { findBookCategory } from "@/lib/book-categories";
import { normalizeSearchDocument } from "@/lib/open-library";

const SEARCH_FIELDS = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "edition_count",
  "cover_i",
  "subject",
  "language",
  "publisher",
  "isbn",
  "number_of_pages_median",
  "ratings_average",
  "ratings_count",
].join(",");

function boundedInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), max) : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 120);
  const categorySlug = searchParams.get("category");
  const category = categorySlug ? findBookCategory(categorySlug) : undefined;

  if (categorySlug && !category) {
    return NextResponse.json({ error: "تصنيف الكتب غير معروف." }, { status: 400 });
  }
  const page = boundedInteger(searchParams.get("page"), 1, 1000);
  const limit = boundedInteger(searchParams.get("limit"), 16, 30);
  const clauses = [
    query || null,
    category ? `subject:"${category.subject}"` : null,
    category?.language ? `language:${category.language}` : null,
  ].filter((clause): clause is string => Boolean(clause));

  const upstreamParams = new URLSearchParams({
    q: clauses.join(" ") || "subject:fiction",
    fields: SEARCH_FIELDS,
    page: String(page),
    limit: String(limit),
  });

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?${upstreamParams.toString()}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "تعذّر تحميل الكتب من المصدر العام الآن." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      num_found?: number;
      numFound?: number;
      docs?: unknown[];
    };

    const books = (data.docs ?? [])
      .map((doc) =>
        doc && typeof doc === "object"
          ? normalizeSearchDocument(doc)
          : null,
      )
      .filter((book): book is NonNullable<typeof book> => book !== null);

    return NextResponse.json({
      books,
      total: data.num_found ?? data.numFound ?? books.length,
      page,
      limit,
      source: "Open Library",
    });
  } catch {
    return NextResponse.json(
      { error: "تعذّر الاتصال بمصدر الكتب. حاول مرة أخرى بعد قليل." },
      { status: 502 },
    );
  }
}
