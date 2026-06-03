
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Queries to scrape
CREATE TABLE public.prometheus_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  query text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prometheus_queries TO authenticated;
GRANT ALL ON public.prometheus_queries TO service_role;
ALTER TABLE public.prometheus_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read queries" ON public.prometheus_queries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage queries" ON public.prometheus_queries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Historical samples
CREATE TABLE public.prometheus_samples (
  id bigserial PRIMARY KEY,
  query_name text NOT NULL,
  metric text,
  labels jsonb NOT NULL DEFAULT '{}'::jsonb,
  value double precision NOT NULL,
  scraped_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX prometheus_samples_query_time_idx
  ON public.prometheus_samples (query_name, scraped_at DESC);
CREATE INDEX prometheus_samples_scraped_at_idx
  ON public.prometheus_samples (scraped_at DESC);

GRANT SELECT ON public.prometheus_samples TO authenticated;
GRANT ALL ON public.prometheus_samples TO service_role;
ALTER TABLE public.prometheus_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read samples" ON public.prometheus_samples
  FOR SELECT TO authenticated USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER prometheus_queries_set_updated_at
BEFORE UPDATE ON public.prometheus_queries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed
INSERT INTO public.prometheus_queries (name, query) VALUES
  ('up', 'up'),
  ('node_load1', 'node_load1'),
  ('node_memory_available_bytes', 'node_memory_MemAvailable_bytes'),
  ('http_requests_rate_5m', 'sum(rate(http_requests_total[5m]))')
ON CONFLICT (name) DO NOTHING;
