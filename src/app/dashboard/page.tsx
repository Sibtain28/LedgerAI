import { AuditReport } from "@/components/dashboard/AuditReport";
import { Header } from "@/components/layout/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        <AuditReport />
      </main>
    </div>
  );
}
