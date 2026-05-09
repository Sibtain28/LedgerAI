"use client";

import { useSearchParams } from "next/navigation";
import { AuditReport } from "@/components/dashboard/AuditReport";
import { Header } from "@/components/layout/Header";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;

  return <AuditReport id={id} />;
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono">Loading ledger...</div>}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
