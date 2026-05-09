import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-none supports-[backdrop-filter]:bg-background/95">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-3" aria-label="LedgerAI Home">
              <div className="size-6 bg-foreground flex items-center justify-center">
                <span className="text-background font-mono font-bold text-xs leading-none">L</span>
              </div>
              <span className="inline-block font-semibold tracking-tight text-lg">LedgerAI</span>
            </Link>
            <nav className="hidden md:flex gap-8" aria-label="Main Navigation">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                History
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex text-xs font-mono bg-muted/50 px-3 py-1.5 border border-border items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"></span>
              <span className="uppercase tracking-widest text-muted-foreground font-semibold">System Operational</span>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
