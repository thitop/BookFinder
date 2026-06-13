// src/routes/ReadingList.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { removeFromReadingList, updateStatus } from "../store/readingListSlice";
import type { ReadingStatus } from "../store/readingListSlice";
import { Link } from "react-router-dom";

export default function ReadingList() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: readingList } = useSelector((state: RootState) => state.readingList);
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | "all">("all");

  // กรองตามสถานะ
  const filteredList =
    selectedStatus === "all"
      ? readingList
      : readingList.filter((item) => item.status === selectedStatus);

  // สถิติ
  const stats = {
    total: readingList.length,
    wantToRead: readingList.filter((i) => i.status === "want-to-read").length,
    reading: readingList.filter((i) => i.status === "reading").length,
    finished: readingList.filter((i) => i.status === "finished").length,
  };

  const statusConfig = {
    "want-to-read": { label: "อยากอ่าน", color: "bg-blue-100 text-blue-700", icon: "📚" },
    reading: { label: "กำลังอ่าน", color: "bg-yellow-100 text-yellow-700", icon: "📖" },
    finished: { label: "อ่านเสร็จแล้ว", color: "bg-green-100 text-green-700", icon: "✓" },
  };

  const handleStatusChange = (bookId: string, newStatus: ReadingStatus) => {
    dispatch(updateStatus({ bookId, status: newStatus }));
  };

  const handleRemove = (bookId: string) => {
    if (confirm("ต้องการลบหนังสือเล่มนี้ออกจาก Reading List หรือไม่?")) {
      dispatch(removeFromReadingList(bookId));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Reading List</h1>
        <p className="text-gray-600">จัดการรายการหนังสือที่คุณต้องการอ่าน</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">ทั้งหมด</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow p-6 border border-blue-100">
          <div className="text-3xl font-bold text-blue-700">{stats.wantToRead}</div>
          <div className="text-sm text-blue-600">อยากอ่าน</div>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-6 border border-yellow-100">
          <div className="text-3xl font-bold text-yellow-700">{stats.reading}</div>
          <div className="text-sm text-yellow-600">กำลังอ่าน</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-6 border border-green-100">
          <div className="text-3xl font-bold text-green-700">{stats.finished}</div>
          <div className="text-sm text-green-600">อ่านเสร็จแล้ว</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          className={`btn btn-sm ${selectedStatus === "all" ? "btn-neutral" : "btn-ghost"}`}
          onClick={() => setSelectedStatus("all")}
        >
          ทั้งหมด ({stats.total})
        </button>
        <button
          className={`btn btn-sm ${selectedStatus === "want-to-read" ? "btn-info" : "btn-ghost"}`}
          onClick={() => setSelectedStatus("want-to-read")}
        >
          📚 อยากอ่าน ({stats.wantToRead})
        </button>
        <button
          className={`btn btn-sm ${selectedStatus === "reading" ? "btn-warning" : "btn-ghost"}`}
          onClick={() => setSelectedStatus("reading")}
        >
          📖 กำลังอ่าน ({stats.reading})
        </button>
        <button
          className={`btn btn-sm ${selectedStatus === "finished" ? "btn-success" : "btn-ghost"}`}
          onClick={() => setSelectedStatus("finished")}
        >
          ✓ อ่านเสร็จ ({stats.finished})
        </button>
      </div>

      {/* Reading List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            ยังไม่มีรายการหนังสือ
          </h3>
          <p className="text-gray-500 mb-6">
            เริ่มเพิ่มหนังสือที่คุณต้องการอ่านได้เลย
          </p>
          <Link to="/" className="btn btn-primary">
            ค้นหาหนังสือ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item, index) => {
            const config = statusConfig[item.status];
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100"
              >
                <div className="flex gap-6">
                  {/* Book Cover */}
                  <Link to={`/book/${item.book.id}`}>
                    <img
                      src={item.book.cover || "https://placehold.co/120x180?text=No+Cover"}
                      alt={item.book.title}
                      className="w-24 h-36 object-cover rounded-lg shadow hover:scale-105 transition"
                    />
                  </Link>

                  {/* Book Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/book/${item.book.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">
                          {item.book.title}
                        </h3>
                      </Link>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleRemove(item.book.id as string)}
                      >
                        ✕
                      </button>
                    </div>

                    {item.book.author && (
                      <p className="text-gray-600 mb-3">โดย {item.book.author}</p>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <span className={`badge ${config.color} gap-1`}>
                        {config.icon} {config.label}
                      </span>
                      {item.book.year && (
                        <span className="text-sm text-gray-500">{item.book.year}</span>
                      )}
                      {typeof item.book.rating === 'number' && (
                        <span className="text-sm text-yellow-600">
                          ⭐ {item.book.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Status Changer */}
                    <div className="flex gap-2 mb-3">
                      <button
                        className={`btn btn-xs ${item.status === "want-to-read" ? "btn-info" : "btn-ghost"}`}
                        onClick={() => handleStatusChange(item.book.id as string, "want-to-read")}
                      >
                        📚 อยากอ่าน
                      </button>
                      <button
                        className={`btn btn-xs ${item.status === "reading" ? "btn-warning" : "btn-ghost"}`}
                        onClick={() => handleStatusChange(item.book.id as string, "reading")}
                      >
                        📖 กำลังอ่าน
                      </button>
                      <button
                        className={`btn btn-xs ${item.status === "finished" ? "btn-success" : "btn-ghost"}`}
                        onClick={() => handleStatusChange(item.book.id as string, "finished")}
                      >
                        ✓ อ่านเสร็จ
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">
                      เพิ่มเมื่อ {new Date(item.addedAt).toLocaleDateString("th-TH", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}