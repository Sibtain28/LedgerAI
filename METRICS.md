# Metrics

## North Star Metric

**Qualified Audits Completed per Week**

A "qualified audit" = user enters at least 2 tools with >$200 total 
monthly spend and reaches the email capture step. This is the metric 
that drives everything: it measures real intent, real data quality, 
and is the leading indicator for both Credex consultations and viral sharing.

Why not DAU/MAU: This tool is used once per quarter per company, 
not daily. DAU would be misleading and near-zero by design.

## 3 Input Metrics

1. **Onboarding completion rate** (audit started → email captured)  
   Target: >45%. Below 35% = form is too long or confusing.

2. **Savings discovery rate** (% of audits finding >$200/mo savings)  
   Target: >60%. Below 40% = pricing data stale or engine rules too weak.

3. **Share rate** (audits where share URL is copied / total audits)  
   Target: >15%. Below 8% = savings numbers not compelling or share UX buried.

## What to Instrument First

1. Funnel: step-by-step drop-off in onboarding (which step loses users)
2. Savings distribution: histogram of monthly savings found per audit
3. Share URL click-throughs: how many share links get opened by someone 
   other than the original user

## Pivot Trigger

If after 500 audits: median savings found < $100/mo AND share rate < 5% → 
the pricing data or engine rules are not resonating. Pivot to interview 
mode: talk to 10 users who completed audits and ask what felt wrong.
