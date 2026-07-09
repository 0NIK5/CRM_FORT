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
          {rows.map((row, i) => (
            <tr key={i} className={rowHref ? 'hover:bg-brand-light/40 cursor-pointer' : 'hover:bg-surface-soft'}>
              {columns.map((c) => {
                const content = c.render ? c.render(row) : String(row[c.key]);
                return (
                  <td key={c.key} className="px-4 py-3 border-t border-surface-muted">
                    {rowHref ? <Link href={rowHref(row)} className="block">{content}</Link> : content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
