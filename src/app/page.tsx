import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/landing/Hero";
import { ProblemVisualization } from "@/components/landing/ProblemVisualization";
import { AuditWorkflow } from "@/components/landing/AuditWorkflow";
import { SavingsExamples } from "@/components/landing/SavingsExamples";
import { QuoteSection } from "@/components/landing/QuoteSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <ProblemVisualization />
        <AuditWorkflow />
        <SavingsExamples />
        <QuoteSection />
        <CTASection />
      </main>
    </>
  );
}
