# LedgerAI — Free AI Spend Auditor for Startups

LedgerAI helps startup founders and engineering managers find where 
they're overspending on AI tools like Cursor, ChatGPT, Claude, GitHub 
Copilot, and more. Takes 2 minutes. No signup required to see results.

**Live:** https://ledger-ai-psi.vercel.app

## Screenshots

> Add 3+ screenshots here after deployment

![Onboarding Form](docs/screenshot-onboarding.png)
![Audit Dashboard](docs/screenshot-dashboard.png)
![Share Page](docs/screenshot-share.png)

## Who it's for

Startup CTOs, engineering managers, and CFOs at Series A/B companies 
who pay for multiple AI tools but have no systematic way to audit overlap, 
overprovisioning, or billing mismatches.

## Quick Start

```bash
git clone https://github.com/Sibtain28/LedgerAI.git
cd ledger-ai
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_APP_URL=your_deployed_url
```
