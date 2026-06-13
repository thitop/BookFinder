// src/routes/Home.tsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks, setPage, setQuery } from "../store/BookSlice";
import type { RootState, AppDispatch } from "../store/store";
import BookGrid from "../components/BookGrid";
import Pagination from "../components/Pagination";
import SkeletonBookCard from "../components/SkeletonBookCard";
import { motion } from "framer-motion";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error, total, limit, offset, q } = useSelector(
    (s: RootState) => s.books
  );

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "a-z" | "z-a" | "year">("default");

  useEffect(() => {
    // โหลดข้อมูลเมื่อมีการเปลี่ยนแปลง (รวมถึงตอน mount เพราะมีค่า q เริ่มต้น)
    if (q) {
      const searchQuery = category ? `${q} subject:${category}` : q;
      dispatch(fetchBooks({ q: searchQuery, offset, limit }));
    }
  }, [dispatch, offset, limit, q, category]);

  // กรองและเรียงข้อมูล
  const sortedItems = useMemo(() => {
    const sorted = [...items];

    switch (sortBy) {
      case "a-z":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "year":
        return sorted.sort((a, b) => {
          const yearA = a.year ? Number(a.year) : 0;
          const yearB = b.year ? Number(b.year) : 0;
          return yearB - yearA;
        });
      default:
        return sorted;
    }
  }, [items, sortBy]);

  const handleSearch = () => {
    if (!searchInput.trim()) {
      alert("กรุณาใส่คำค้นหา");
      return;
    }
    dispatch(setQuery(searchInput));
    dispatch(setPage({ offset: 0, limit }));
  };

  const categories = [
    { value: "", label: "ทุกประเภท" },
    { value: "Fiction", label: "นิยาย" },
    { value: "Science", label: "วิทยาศาสตร์" },
    { value: "History", label: "ประวัติศาสตร์" },
    { value: "Biography", label: "ชีวประวัติ" },
    { value: "Business", label: "ธุรกิจ" },
    { value: "Computers", label: "คอมพิวเตอร์" },
    { value: "Cooking", label: "อาหาร" },
    { value: "Art", label: "ศิลปะ" },
    { value: "Self-Help", label: "พัฒนาตนเอง" },
  ];

  return (
    <motion.div
      className="container mx-auto p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="input input-bordered w-full max-w-md"
            placeholder="ค้นหาหนังสือ เช่น javascript, react, python..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>

        {/* Filters */}
        {q && (
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Filter */}
            <select
              className="select select-bordered select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              className="select select-bordered select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="default">เรียงตามความเกี่ยวข้อง</option>
              <option value="a-z">เรียง A-Z</option>
              <option value="z-a">เรียง Z-A</option>
              <option value="year">เรียงตามปี</option>
            </select>

            <div className="text-sm text-gray-600">
            </div>
          </div>
        )}
      </div>



      {/* Loading State */}
      {status === "loading" && (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 py-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonBookCard key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {status === "failed" && (
        <div className="alert alert-error mb-4">
          {error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}
        </div>
      )}

      {/* Results */}
      {status === "succeeded" && q && (
        <>
          <BookGrid items={sortedItems} />
          <Pagination
            total={total}
            limit={limit}
            offset={offset}
            onChange={(newOffset) => dispatch(setPage({ offset: newOffset, limit }))}
          />
        </>
      )}
    </motion.div>
  );
}