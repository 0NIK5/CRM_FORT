import { Sidebar, ADMIN_ITEMS } from '@/components/ui/Sidebar';
import { Topbar } from '@/components/ui/Topbar';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar items={ADMIN_ITEMS} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
