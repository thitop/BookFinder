// src/components/Pagination.tsx
type Props = {
  total: number;
  limit: number;
  offset: number;
  onChange: (newOffset: number) => void;
};

export default function Pagination({ total, limit, offset, onChange }: Props) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="join mt-6">
      <button
        className="join-item btn"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(0, offset - limit))}
      >
        « Prev
      </button>

      <button className="join-item btn btn-ghost" disabled>
        Page {page} / {pages}
      </button>

      <button
        className="join-item btn"
        disabled={page >= pages}
        onClick={() => onChange(offset + limit)}
      >
        Next »
      </button>
    </div>
  );
}
