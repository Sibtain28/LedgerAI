-- LedgerAI: Supabase Database Schema

-- 1. Create Audits Table
CREATE TABLE IF NOT EXISTS public.audits (
    id TEXT PRIMARY KEY, -- LDG-XXXX
    data JSONB NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id TEXT REFERENCES public.audits(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policies (Read/Write)
-- Note: In production, you may want to restrict this further.
CREATE POLICY "Allow public insert" ON public.audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.audits FOR SELECT USING (true);

CREATE POLICY "Allow public insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select leads" ON public.leads FOR SELECT USING (true);
