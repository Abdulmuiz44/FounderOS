import { AppSidebar } from '@/components/dashboard/AppSidebar';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AppSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header could go here or inside pages */}
        {children}
      </div>
    </div>
  );
}
