// src/components/BookGrid.tsx
import type { Book } from "../types/book";
import BookCard from "./BookCard";

export default function BookGrid({ items }: { items: Book[] }) {
  if (!items?.length) {
    return <div className="text-center opacity-70 p-10">No books to display.</div>;
  }

  return (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {items.map((b) => <BookCard key={b.id} book={b} />)}
    </div>
  );
}
