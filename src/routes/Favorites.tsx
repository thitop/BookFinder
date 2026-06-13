// src/routes/Favorites.tsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import BookGrid from "../components/BookGrid";
import type { Book } from "../types/book";

export default function Favorites() {
  const { ids } = useSelector((state: RootState) => state.favorites);
  const { items: allBooks } = useSelector((state: RootState) => state.books);
  
  const [favBooks, setFavBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setFavBooks([]);
      return;
    }

    // กรองหนังสือที่อยู่ใน favorites จาก items ที่มีอยู่แล้ว
    const filtered = allBooks.filter(book => 
      ids.includes(String(book.id))
    );
    
    setFavBooks(filtered);
  }, [ids, allBooks]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📚 My Favorite Books</h1>

      {favBooks.length > 0 ? (
        <>
          <div className="mb-4 text-sm opacity-70">
            คุณมีหนังสือโปรด {favBooks.length} เล่ม
          </div>
          <BookGrid items={favBooks} />
        </>
      ) : (
        <div className="text-center opacity-70 p-10">
          <p className="text-lg mb-2">ยังไม่มีหนังสือโปรด</p>
          <p className="text-sm">
            ไปที่หน้า Home แล้วคลิกที่หนังสือเพื่อเพิ่มในรายการโปรด
          </p>
        </div>
      )}
    </div>
  );
}