import { PortalSidebar, PORTAL_ITEMS } from './nav';
import { Topbar } from '@/components/ui/Topbar';
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      <PortalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar items={PORTAL_ITEMS} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
