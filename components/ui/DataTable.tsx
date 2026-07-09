import Link from 'next/link';
export type Column<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };
export function DataTable<T extends Record<string, any>>({ columns, rows, rowHref }:
  { columns: Column<T>[]; rows: T[]; rowHref?: (row: T) => string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-surface-muted bg-white">
      <table className="w-full text-sm">
        <thead className="bg-surface-soft text-left text-ink/60">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cells = columns.map((c) => (
              <td key={c.key} className="px-4 py-3 border-t border-surface-muted">
                {c.render ? c.render(row) : String(row[c.key])}
              </td>
            ));
            return rowHref ? (
              <tr key={i} className="hover:bg-brand-light/40 cursor-pointer">
                {columns.map((c, j) => (
                  <td key={c.key} className="px-4 py-3 border-t border-surface-muted">
                    <Link href={rowHref(row)} className="block">
                      {c.render ? c.render(row) : String(row[c.key])}
                    </Link>
                  </td>
                ))}
              </tr>
            ) : <tr key={i} className="hover:bg-surface-soft">{cells}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
