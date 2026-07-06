import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, count, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <span className="text-sm text-slate-500">
        Showing {start}–{end} of {count}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
