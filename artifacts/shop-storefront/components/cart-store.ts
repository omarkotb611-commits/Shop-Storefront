import type { BookSummary } from "@/lib/open-library";

const STORAGE_KEY = "rufoof-saved-books";
const EVENT_NAME = "rufoof-cart-change";

export type SavedBook = Pick<BookSummary, "id" | "title" | "authors" | "coverUrl" | "firstPublishYear">;

export function readSavedBooks(): SavedBook[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveBook(book: BookSummary) {
  const books = readSavedBooks();
  if (books.some((saved) => saved.id === book.id)) return;
  const next: SavedBook[] = [...books, {
    id: book.id,
    title: book.title,
    authors: book.authors,
    coverUrl: book.coverUrl,
    firstPublishYear: book.firstPublishYear,
  }];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function removeSavedBook(id: string) {
  const next = readSavedBooks().filter((book) => book.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function isBookSaved(id: string) {
  return readSavedBooks().some((book) => book.id === id);
}

export function cartEventName() {
  return EVENT_NAME;
}
