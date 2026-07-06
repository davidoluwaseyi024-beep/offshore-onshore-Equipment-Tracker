import clsx from "clsx";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-x-auto rounded-lg border border-slate-200 bg-white", className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function TableHeaderCell({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={clsx(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TableRow({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={clsx(onClick && "cursor-pointer hover:bg-slate-50", className)}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx("px-4 py-3 text-slate-700", className)}>{children}</td>;
}

export function EmptyState({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}
