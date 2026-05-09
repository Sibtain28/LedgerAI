"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans">
      <Container>
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-red-500 shadow-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            Ledger Protocol Interrupted
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tighter">System Failure</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              An unhandled exception has occurred within the audit engine. The integrity of the current calculation state cannot be verified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => reset()}
              size="lg" 
              className="h-14 px-8 uppercase tracking-widest font-bold shadow-none rounded-none"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Attempt System Recovery
            </Button>
            <Link href="/">
              <Button 
                variant="outline"
                size="lg" 
                className="h-14 px-8 uppercase tracking-widest font-bold shadow-none rounded-none border-border"
              >
                Return to Command Center
              </Button>
            </Link>
          </div>

          <div className="pt-12 border-t border-border mt-12">
            <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">
              Error Digest: {error.digest || "NO_DIGEST_AVAILABLE"}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
