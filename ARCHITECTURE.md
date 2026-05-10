# Architecture

## System Diagram

```mermaid
flowchart TD
    A[User lands on /] --> B[/onboarding - 6-step form]
    B --> C{Form complete?}
    C -->|Yes| D[evaluateAuditData - engine.ts]
    D --> E[AuditRecord saved to localStorage]
    D --> F[AuditRecord saved to Supabase]
    E --> G[/dashboard?id=LDG-XXXX]
    F --> G
    G --> H[AuditReport component]
    H --> I[POST /api/ai-summary]
    I --> J[Anthropic claude-sonnet-4]
    J --> H
    G --> K[Share button copies /share/LDG-XXXX]
    K --> L[/share/id - server component]
    L --> F
```

## Data Flow

1. User fills 6-step onboarding form (tool inventory per tool)
2. `evaluateAuditData()` runs pure TypeScript rules against the tool array
3. `AuditRecord` is written to both localStorage (instant) and Supabase 
   (async, for sharing)
4. User lands on `/dashboard?id=LDG-XXXX` — data loaded from localStorage 
   first, Supabase as fallback
5. Dashboard fires POST to `/api/ai-summary` with audit context → Claude 
   returns a personalized paragraph
6. Share button copies `/share/LDG-XXXX` — that page fetches from Supabase 
   server-side, strips PII, renders public view

## Stack Choice

- **Next.js 15 App Router** — server components for share page OG/SEO, 
  client components for interactive dashboard. Chosen over Vite/React SPA 
  for the metadata generation needed on share pages.
- **TypeScript** — strict mode throughout. Catches pricing calculation errors 
  at compile time.
- **Supabase** — free tier sufficient for MVP, instant setup, RLS policies 
  already configured. Chose over Firebase for SQL query flexibility.
- **Tailwind CSS v4** — utility-first, no design system lock-in.
- **Anthropic SDK** — direct API, no wrapper. claude-sonnet-4 chosen for 
  quality/cost balance on short outputs.

## Scaling to 10k Audits/Day

- Move `evaluateAuditData` to an Edge Function — stateless, parallelizable
- Add Redis cache layer for AI summaries (same input = same output)
- Supabase connection pooling via PgBouncer (already available)
- Rate limit `/api/ai-summary` per IP using Upstash
- Add a job queue (Inngest/Trigger.dev) for async email sending

## What I'd Change

- Replace localStorage history with user accounts (Supabase Auth)
- Add real-time pricing sync via vendor APIs instead of hardcoded values
- Instrument with PostHog for funnel analytics
