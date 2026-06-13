// src/types/book.ts

// Type สำหรับหนังสือแต่ละเล่ม
export type Book = {
  id: string | number;
  title: string;
  author?: string | null;
  year?: string | number | null;
  cover?: string | null;
  rating?: number | null;
};

// Type สำหรับ Response จาก fetchBooks (Open Library)
export type BooksResponse = {
  total: number;
  count: number;
  offset: number;
  limit: number;
  items: Book[];
};

// Type สำหรับหน้ารายละเอียด (มีข้อมูลเพิ่มเติม)
export type BookDetail = Book & {
  description?: string | null;
  subjects?: string[] | null;
};