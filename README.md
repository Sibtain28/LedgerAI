# LedgerAI: Financial Intelligence for AI Infrastructure

LedgerAI is an enterprise-grade auditing platform designed to reconcile and optimize AI infrastructure spend for high-growth startups. It provides a deterministic framework for identifying subscription redundancies, API volume inefficiencies, and seat-level optimization opportunities across foundational model providers and AI-native tools.

## Why LedgerAI Exists

As AI infrastructure becomes a core component of the modern technical stack, spend management has transitioned from a simple line item to a complex reconciliation challenge. Startups often suffer from **"Shadow AI Leakage"**—untracked API usage, redundant coding assistant subscriptions, and oversized team plans that lack seat-level utilization.

LedgerAI provides the fiscal discipline required to scale AI infrastructure efficiently, offering consulting-grade audits through a deterministic rules engine rather than subjective LLM analysis.

## Key Features

- **Deterministic Audit Engine**: Precision-based reconciliation of infrastructure spend.
- **Persistent Archival Ledger**: Unique audit IDs (`LDG-XXXX`) with full historical persistence.
- **Investor-Grade Exports**: High-fidelity PDF reports for stakeholders and financial reporting.
- **Deep-Linkable Audits**: Shareable report states for collaborative infrastructure review.
- **Monochrome Editorial UI**: A high-contrast design system optimized for readability and data density.

## System Architecture

### 1. Audit Engine Architecture
The core logic resides in `src/lib/audit/`, separating data collection from analysis:
- **Registry**: A centralized tool and pricing metadata system.
- **Heuristics**: A deterministic ruleset that flags anomalies (e.g., redundant coding assistants).
- **Calculator**: A utility layer for identifying leakage percentages and optimization scores.

### 2. Pricing Intelligence System
LedgerAI maintains a registry of enterprise and consumer pricing tiers for:
- **Foundational Models**: OpenAI (GPT-4/O1), Anthropic (Claude 3), GCP Gemini, AWS Bedrock.
- **Productivity Tools**: Cursor, GitHub Copilot.
- **Enterprise Chat**: ChatGPT Team and Plus.

### 3. Dynamic Recommendation Engine
The engine generates specific, actionable financial advice based on stack topology:
- **Redundancy Detection**: Identifying overlapping IDE extensions (Cursor + Copilot).
- **Tier Rightsizing**: Downgrading oversized Team plans to individual seats based on efficiency scores.
- **Volume Strategy**: Identifying thresholds for volume-based API discounting.

### 4. PDF Export System
Utilizing a high-fidelity capture system (`jspdf` + `html2canvas`), LedgerAI generates professional PDF reports that preserve the platform's editorial aesthetics, ensuring reports are ready for executive distribution.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Persistence**: LocalStorage with Hydration Safety
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

## Local Development

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sibtain28/LedgerAI.git
   cd ledger-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the development server:
   ```bash
   npm run dev
   ```

## Deployment

LedgerAI is optimized for deployment on **Vercel** or any Edge-ready infrastructure.
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The application utilizes client-side persistence for the ledger, making it highly compatible with static hosting and edge distributions.

## Design Philosophy

LedgerAI adheres to a **"Financial Editorial"** aesthetic:
- **High Contrast**: A strict monochrome palette for maximum legibility.
- **Zero Radius**: Sharp borders (`0rem`) to evoke the feel of traditional financial ledgers.
- **Typographic Hierarchy**: `Inter` for interface elements; `JetBrains Mono` for all numerical data and IDs.
- **Stark Aesthetics**: No gradients, shadows, or rounded corners—prioritizing data density and clarity.

## Future Improvements

- **API-First Reconciliation**: Direct OAuth integration with OpenAI and Anthropic billing APIs.
- **Multi-Tenant Organizations**: Support for team-based audit management.
- **Real-Time Anomaly Alerts**: Webhook integrations for sudden API spend spikes.
- **Forecast Engine**: Predictive infrastructure modeling based on historical growth patterns.

---

*LedgerAI is a financial intelligence project designed for startups scaling AI infrastructure.*
