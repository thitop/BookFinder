// src/routes/BookDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState, AppDispatch } from "../store/store";
import { toggleFavorite } from "../store/favoritesSlice";
import { addToReadingList } from "../store/readingListSlice";
import type { ReadingStatus } from "../store/readingListSlice";
import { supabase } from "../lib/supabase";

// Extended BookDetail with Google Books data
type BookDetail = {
  id: string;
  title: string;
  author?: string | null;
  authors?: string[];
  year?: string | number | null;
  cover?: string | null;
  description?: string | null;
  subjects?: string[] | null;
  categories?: string[];
  pageCount?: number;
  publisher?: string;
  publishedDate?: string;
  language?: string;
  isbn10?: string;
  isbn13?: string;
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
  buyLink?: string;
  source?: 'google' | 'openlibrary';
};

// ฟังก์ชันดึงข้อมูลจาก Google Books API
async function fetchGoogleBooks(query: string): Promise<BookDetail | null> {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const book = data.items[0];
    const volumeInfo = book.volumeInfo;
    const saleInfo = book.saleInfo;

    // Extract ISBNs
    let isbn10: string | undefined;
    let isbn13: string | undefined;

    if (volumeInfo.industryIdentifiers) {
      volumeInfo.industryIdentifiers.forEach((id: any) => {
        if (id.type === 'ISBN_10') isbn10 = id.identifier;
        if (id.type === 'ISBN_13') isbn13 = id.identifier;
      });
    }

    // Get best quality cover image
    let cover = null;
    if (volumeInfo.imageLinks) {
      cover = volumeInfo.imageLinks.extraLarge ||
        volumeInfo.imageLinks.large ||
        volumeInfo.imageLinks.medium ||
        volumeInfo.imageLinks.thumbnail ||
        volumeInfo.imageLinks.smallThumbnail;

      // Upgrade to HTTPS and request higher zoom
      if (cover) {
        cover = cover.replace('http:', 'https:');
      }
    }

    return {
      id: book.id,
      title: volumeInfo.title || '(No title)',
      author: volumeInfo.authors?.[0] || null,
      authors: volumeInfo.authors || [],
      year: volumeInfo.publishedDate?.split('-')[0] || null,
      cover: volumeInfo.imageLinks?.extraLarge ||
        volumeInfo.imageLinks?.large ||
        volumeInfo.imageLinks?.medium ||
        volumeInfo.imageLinks?.thumbnail ||
        null,
      description: volumeInfo.description || null,
      subjects: null,
      categories: volumeInfo.categories || [],
      pageCount: volumeInfo.pageCount,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      language: volumeInfo.language,
      isbn10,
      isbn13,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink,
      buyLink: saleInfo?.buyLink,
      source: 'google',
    };
  } catch (error) {
    console.error('Google Books API error:', error);
    return null;
  }
}

// ฟังก์ชันดึงข้อมูลจาก Open Library (สำรอง)
async function fetchOpenLibrary(id: string): Promise<BookDetail | null> {
  try {
    const decodedId = decodeURIComponent(id);
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(decodedId)}&limit=1`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const doc = data.docs?.[0];

    if (!doc) return null;

    const isbn = doc.isbn?.[0];
    const olid = doc.edition_key?.[0] || doc.lending_edition_s;
    const ia = doc.ia?.[0];

    const cover = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`
      : isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
        : olid
          ? `https://covers.openlibrary.org/b/olid/${olid}-L.jpg?default=false`
          : ia
            ? `https://archive.org/services/img/${ia}`
            : null;

    let description = null;
    if (doc.key) {
      try {
        const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
        if (workRes.ok) {
          const workData = await workRes.json();
          const descRaw = typeof workData.description === 'string' 
            ? workData.description 
            : workData.description?.value;
            
          if (descRaw) {
            // Convert plain text newlines to HTML <br /> for rendering
            description = descRaw.replace(/\n/g, '<br />');
          }
        }
      } catch (e) {
        console.error("Failed to fetch work details", e);
      }
    }

    return {
      id: decodedId,
      title: doc.title || '(No title)',
      author: doc.author_name?.[0] || null,
      authors: doc.author_name || [],
      year: doc.first_publish_year || doc.publish_year?.[0] || null,
      cover,
      description,
      subjects: doc.subject?.slice(0, 10) || null,
      publisher: doc.publisher?.[0],
      publishedDate: doc.first_publish_year?.toString(),
      previewLink: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
      infoLink: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
      source: 'openlibrary',
    };
  } catch (error) {
    console.error('Open Library error:', error);
    return null;
  }
}

export default function BookDetail() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { ids: favIds } = useSelector((s: RootState) => s.favorites);
  const { items: readingListItems } = useSelector((s: RootState) => s.readingList);

  const [book, setBook] = useState<BookDetail | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    let active = true;

    const fetchBook = async () => {
      if (!id) return;

      setStatus("loading");

      // ลองดึงจาก Google Books ก่อน
      let data = await fetchGoogleBooks(id);

      // ถ้าไม่เจอ ลองดึงจาก Open Library
      if (!data) {
        data = await fetchOpenLibrary(id);
      }

      if (!active) return;

      setBook(data);
      setStatus(data ? "idle" : "error");
    };

    fetchBook();

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex items-center justify-center">
        <div>
          <span className="loading loading-lg loading-spinner"></span>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลหนังสือ...</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !book) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex items-center justify-center">
        <div>
          <div className="text-6xl mb-4">📚</div>
          <div className="alert alert-error mb-4 max-w-md mx-auto">
            ไม่พบข้อมูลหนังสือที่เลือก
          </div>
          <Link to="/" className="btn btn-primary">
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const isFavorited = favIds.includes(String(book.id));
  const currentReadingStatus = readingListItems.find((item) => item.book.id === book.id)?.status;

  const handleAddToReadingList = async (newStatus: ReadingStatus) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    if (!book) return;

    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author || null,
      year: book.year || null,
      cover: book.cover || null,
      rating: book.averageRating || null,
    };

    dispatch(addToReadingList({ book: bookData, status: newStatus }));

    // แสดง Toast notification
    const statusText = {
      'want-to-read': 'อยากอ่าน',
      'reading': 'กำลังอ่าน',
      'finished': 'อ่านเสร็จแล้ว'
    };

    setToast({
      show: true,
      message: `เพิ่มในรายการ "${statusText[newStatus]}" แล้ว`,
      type: 'success'
    });

    // ซ่อน Toast หลัง 3 วินาที
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    if (!book) return;

    dispatch(toggleFavorite(book.id));

    const willBeFavorited = !isFavorited;
    setToast({
      show: true,
      message: willBeFavorited ? 'เพิ่มในรายการโปรดแล้ว ⭐' : 'ลบออกจากรายการโปรดแล้ว',
      type: willBeFavorited ? 'success' : 'info'
    });

    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  return (
    <motion.div
      className="container mx-auto p-4 max-w-7xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast toast-top toast-center z-50">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-info'} shadow-lg`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <Link to="/" className="btn btn-ghost mb-6">
        ← กลับหน้าแรก
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <img
              src={book.cover || "https://placehold.co/400x600?text=No+Cover"}
              alt={book.title}
              className="rounded-2xl shadow-2xl w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/400x600?text=No+Cover";
              }}
            />

            {/* Source Badge */}
            <div className="mt-4 text-center">
              <span className="badge badge-sm badge-outline">
                {book.source === 'google' ? '📗 Google Books' : '📚 Open Library'}
              </span>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Title & Author */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {book.title}
            </h1>

            {book.authors && book.authors.length > 0 && (
              <p className="text-xl text-gray-600 mb-2">
                โดย {book.authors.join(', ')}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-4">
              {book.publishedDate && (
                <span className="flex items-center gap-1">
                  📅 {book.publishedDate}
                </span>
              )}
              {book.publisher && (
                <span className="flex items-center gap-1">
                  🏢 {book.publisher}
                </span>
              )}
              {book.pageCount && (
                <span className="flex items-center gap-1">
                  📄 {book.pageCount} หน้า
                </span>
              )}
              {book.language && (
                <span className="flex items-center gap-1">
                  🌐 {book.language.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          {book.averageRating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-yellow-600">
                  ⭐ {book.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">
                  {book.ratingsCount && (
                    <span>จาก {book.ratingsCount.toLocaleString()} รีวิว</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ISBN */}
          {(book.isbn10 || book.isbn13) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-2">ISBN</h3>
              <div className="space-y-1 text-sm font-mono">
                {book.isbn10 && <div>ISBN-10: {book.isbn10}</div>}
                {book.isbn13 && <div>ISBN-13: {book.isbn13}</div>}
              </div>
            </div>
          )}

          {/* Categories */}
          {book.categories && book.categories.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">หมวดหมู่</h3>
              <div className="flex flex-wrap gap-2">
                {book.categories.map((cat, i) => (
                  <span key={i} className="badge badge-lg badge-outline">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subjects (from Open Library) */}
          {book.subjects && book.subjects.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">หัวเรื่อง</h3>
              <div className="flex flex-wrap gap-2">
                {book.subjects.map((sub, i) => (
                  <span key={i} className="badge badge-outline">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {book.description && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">เกี่ยวกับหนังสือเล่มนี้</h3>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            {/* Primary Actions */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`btn ${isFavorited ? "btn-secondary" : "btn-outline"} gap-2 overflow-hidden`}
                onClick={handleToggleFavorite}
              >
                <AnimatePresence mode="popLayout">
                  {isFavorited ? (
                    <motion.span
                      key="filled"
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      ★
                    </motion.span>
                  ) : (
                    <motion.span
                      key="empty"
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: -20 }}
                    >
                      ☆
                    </motion.span>
                  )}
                </AnimatePresence>
                {isFavorited ? "ในรายการโปรด" : "เพิ่มในรายการโปรด"}
              </motion.button>

              {/* Reading List Buttons - แสดงแยกชัดเจน */}
              <div className="flex gap-2 flex-wrap">
                <button
                  className={`btn ${currentReadingStatus === "want-to-read" ? "btn-info" : "btn-outline btn-info"} gap-2`}
                  onClick={() => handleAddToReadingList("want-to-read")}
                >
                  📚 {currentReadingStatus === "want-to-read" ? "อยากอ่าน ✓" : "อยากอ่าน"}
                </button>

                <button
                  className={`btn ${currentReadingStatus === "reading" ? "btn-warning" : "btn-outline btn-warning"} gap-2`}
                  onClick={() => handleAddToReadingList("reading")}
                >
                  📖 {currentReadingStatus === "reading" ? "กำลังอ่าน ✓" : "กำลังอ่าน"}
                </button>

                <button
                  className={`btn ${currentReadingStatus === "finished" ? "btn-success" : "btn-outline btn-success"} gap-2`}
                  onClick={() => handleAddToReadingList("finished")}
                >
                  {currentReadingStatus === "finished" ? "อ่านเสร็จแล้ว ✓" : "อ่านเสร็จแล้ว"}
                </button>
              </div>
            </div>

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
              {book.buyLink && (
                <a
                  href={book.buyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary gap-2"
                >
                  🛒 ซื้อหนังสือ
                </a>
              )}

              {book.infoLink && (
                <a
                  href={book.infoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline gap-2"
                >
                  ℹ️ ข้อมูลเพิ่มเติม
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}