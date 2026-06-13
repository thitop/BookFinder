// src/components/BookCard.tsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '../types/book';

type Props = {
  book: Book;
};

export default function BookCard({ book }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    // ใช้ encodeURIComponent เพื่อแก้ปัญหา ID ที่มีอักขระพิเศษ
    navigate(`/book/${encodeURIComponent(book.id)}`);
  };

  return (
    <motion.div 
      className="card bg-base-100 shadow hover:shadow-xl transition-shadow cursor-pointer" 
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <figure className="aspect-[2/3] bg-base-200">
        {book.cover ? (
          <img 
            src={book.cover} 
            alt={book.title} 
            className="w-full h-full object-cover" 
            loading="lazy"
            onError={(e) => {
              // ถ้าโหลดรูปไม่ได้ให้แสดง placeholder
              (e.target as HTMLImageElement).src = "https://placehold.co/400x600?text=No+Cover";
            }}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-sm opacity-60">
            No cover
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h3 className="card-title text-base leading-snug line-clamp-2">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-sm opacity-80 line-clamp-1">
            by {book.author}
          </p>
        )}
        <div className="flex items-center justify-between text-sm opacity-80">
          <span>{book.year ?? '-'}</span>
        </div>
      </div>
    </motion.div>
  );
}