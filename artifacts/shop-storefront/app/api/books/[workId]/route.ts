import { NextResponse } from "next/server";
import { getCoverUrl, toDescription } from "@/lib/open-library";

type OpenLibraryReference = { key?: string };
type OpenLibraryEdition = {
  key?: string;
  title?: string;
  publishers?: string[];
  publish_date?: string;
  isbn_10?: string[];
  isbn_13?: string[];
  number_of_pages?: number;
  languages?: OpenLibraryReference[];
  physical_format?: string;
  covers?: number[];
};

async function readJson(url: string, revalidate: number) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  return response.ok ? response.json() : null;
}

function lastPathPart(key?: string) {
  return key?.split("/").filter(Boolean).at(-1) ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workId: string }> },
) {
  const { workId } = await params;
  if (!/^OL\d+W$/.test(workId)) {
    return NextResponse.json({ error: "معرّف الكتاب غير صالح." }, { status: 400 });
  }

  try {
    const workUrl = `https://openlibrary.org/works/${workId}.json`;
    const [work, editionResponse, ratings] = await Promise.all([
      readJson(workUrl, 3600),
      readJson(`https://openlibrary.org/works/${workId}/editions.json?limit=8`, 3600),
      readJson(`https://openlibrary.org/works/${workId}/ratings.json`, 3600),
    ]);

    if (!work) {
      return NextResponse.json({ error: "لم يتم العثور على هذا الكتاب." }, { status: 404 });
    }

    const authorReferences = Array.isArray(work.authors)
      ? work.authors
          .map((entry: { author?: OpenLibraryReference }) => entry.author?.key)
          .filter((key: unknown): key is string => typeof key === "string")
          .slice(0, 4)
      : [];

    const authors = await Promise.all(
      authorReferences.map(async (key: string) => {
        const authorId = lastPathPart(key);
        if (!authorId) return null;
        const author = await readJson(`https://openlibrary.org${key}.json`, 86400);
        return typeof author?.name === "string" ? author.name : authorId;
      }),
    );

    const editions: OpenLibraryEdition[] = Array.isArray(editionResponse?.entries)
      ? editionResponse.entries
      : Array.isArray(editionResponse?.docs)
        ? editionResponse.docs
        : [];
    const firstEdition = editions[0];
    const coverId =
      (Array.isArray(work.covers) ? work.covers[0] : null) ??
      (Array.isArray(firstEdition?.covers) ? firstEdition.covers[0] : null);
    const ratingSummary = ratings?.summary;
    const firstPublishYear =
      typeof work.first_publish_date === "string"
        ? Number.parseInt(work.first_publish_date.slice(0, 4), 10) || null
        : null;

    const book = {
      id: workId,
      title: typeof work.title === "string" ? work.title : "عنوان غير متاح",
      authors: authors.filter((name): name is string => Boolean(name)),
      description: toDescription(work.description),
      firstPublishDate:
        typeof work.first_publish_date === "string" ? work.first_publish_date : null,
      firstPublishYear,
      editionCount:
        typeof editionResponse?.size === "number"
          ? editionResponse.size
          : editions.length,
      coverId: typeof coverId === "number" ? coverId : null,
      coverUrl: getCoverUrl(typeof coverId === "number" ? coverId : null, "L"),
      subjects: Array.isArray(work.subjects)
        ? work.subjects.filter((subject: unknown): subject is string => typeof subject === "string").slice(0, 16)
        : [],
      subjectPlaces: Array.isArray(work.subject_places)
        ? work.subject_places.filter((item: unknown): item is string => typeof item === "string").slice(0, 8)
        : [],
      subjectTimes: Array.isArray(work.subject_times)
        ? work.subject_times.filter((item: unknown): item is string => typeof item === "string").slice(0, 8)
        : [],
      publishers: Array.isArray(firstEdition?.publishers)
        ? firstEdition.publishers.slice(0, 4)
        : [],
      isbns: [
        ...(Array.isArray(firstEdition?.isbn_13) ? firstEdition.isbn_13 : []),
        ...(Array.isArray(firstEdition?.isbn_10) ? firstEdition.isbn_10 : []),
      ].slice(0, 4),
      pageCount:
        typeof firstEdition?.number_of_pages === "number"
          ? firstEdition.number_of_pages
          : null,
      languages: Array.isArray(firstEdition?.languages)
        ? firstEdition.languages
            .map((language) => lastPathPart(language.key))
            .filter((language): language is string => Boolean(language))
        : [],
      format: typeof firstEdition?.physical_format === "string"
        ? firstEdition.physical_format
        : null,
      averageRating:
        typeof ratingSummary?.average === "number" ? ratingSummary.average : null,
      ratingCount:
        typeof ratingSummary?.count === "number" ? ratingSummary.count : null,
      openLibraryUrl: `https://openlibrary.org/works/${workId}`,
      editions: editions.map((edition) => ({
        id: lastPathPart(edition.key),
        title: edition.title ?? null,
        publishers: edition.publishers ?? [],
        publishDate: edition.publish_date ?? null,
        isbns: [
          ...(edition.isbn_13 ?? []),
          ...(edition.isbn_10 ?? []),
        ].slice(0, 2),
        pageCount: edition.number_of_pages ?? null,
        languages: (edition.languages ?? [])
          .map((language) => lastPathPart(language.key))
          .filter((language): language is string => Boolean(language)),
        format: edition.physical_format ?? null,
        coverId: edition.covers?.[0] ?? null,
      })),
      source: "Open Library",
    };

    return NextResponse.json({ book });
  } catch {
    return NextResponse.json(
      { error: "تعذّر تحميل تفاصيل الكتاب. حاول مرة أخرى بعد قليل." },
      { status: 502 },
    );
  }
}
