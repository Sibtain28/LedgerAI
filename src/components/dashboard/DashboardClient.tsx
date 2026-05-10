"use client";

import { useSearchParams } from "next/navigation";
import { AuditReport } from "@/components/dashboard/AuditReport";
import { Header } from "@/components/layout/Header";

export function DashboardClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;

  return (
    <>
      <Header />
      <main className="flex-1">
        <AuditReport id={id} />
      </main>
    </>
  );
}
