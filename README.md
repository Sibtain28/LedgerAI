# LedgerAI — Free AI Spend Auditor for Startups

LedgerAI helps startup founders and engineering managers find where 
they're overspending on AI tools like Cursor, ChatGPT, Claude, GitHub 
Copilot, and more. Takes 2 minutes. No signup required to see results.

**Live:** https://ledger-ai-psi.vercel.app

## Screenshots

<img width="1510" height="852" alt="Screenshot 2026-05-10 at 12 37 08 PM" src="https://github.com/user-attachments/assets/2a9708cc-a215-49e6-b1b9-ba1b7dfef4b3" />

<img width="1512" height="853" alt="Screenshot 2026-05-10 at 12 37 49 PM" src="https://github.com/user-attachments/assets/6e293ee6-6d75-45ca-8f97-50a39f456ad5" />

<img width="1512" height="855" alt="Screenshot 2026-05-10 at 12 38 11 PM" src="https://github.com/user-attachments/assets/7e533a61-e6e8-474a-9138-4c149a112085" />



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
