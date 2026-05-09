import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
      <Container>
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center border border-border bg-muted/30 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
            <Search className="mr-2 h-4 w-4" />
            Entry Not Found
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tighter italic">Error 404</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The requested ledger entry or documentation does not exist in the current protocol index.
            </p>
          </div>

          <Link href="/">
            <Button 
              size="lg" 
              className="h-14 px-8 uppercase tracking-widest font-bold shadow-none rounded-none"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Command Center
            </Button>
          </Link>

          <div className="pt-12 border-t border-border mt-12 opacity-50">
            <div className="grid grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-1 bg-border" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
