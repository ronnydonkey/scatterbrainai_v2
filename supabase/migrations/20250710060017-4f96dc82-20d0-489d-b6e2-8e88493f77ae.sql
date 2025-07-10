-- Add subscription tiers and usage tracking
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS billing_cycle_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS usage_limits JSONB DEFAULT '{"contentGenerations": 50, "perplexityQueries": 0, "voiceTrainingSamples": 10, "niches": 1, "users": 1}'::jsonb;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'content_generation', 'perplexity_query', 'voice_training'
  count INTEGER DEFAULT 1,
  tier TEXT,
  tracked_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on usage_tracking
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for usage tracking
CREATE POLICY "Users can view their org usage" ON public.usage_tracking
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert usage" ON public.usage_tracking
FOR INSERT WITH CHECK (true);

-- Create perplexity queries table
CREATE TABLE IF NOT EXISTS public.perplexity_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  response_data JSONB,
  sources JSONB,
  tier_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on perplexity_queries
ALTER TABLE public.perplexity_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for perplexity queries
CREATE POLICY "Users can view their org perplexity queries" ON public.perplexity_queries
FOR SELECT USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create perplexity queries" ON public.perplexity_queries
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Add trending topics validation columns
ALTER TABLE public.trending_topics 
ADD COLUMN IF NOT EXISTS validation_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS perplexity_research JSONB;

-- Update organizations with tier limits
UPDATE public.organizations 
SET usage_limits = CASE subscription_tier
  WHEN 'starter' THEN '{"contentGenerations": 50, "perplexityQueries": 0, "voiceTrainingSamples": 10, "niches": 1, "users": 1}'::jsonb
  WHEN 'professional' THEN '{"contentGenerations": 500, "perplexityQueries": 10, "voiceTrainingSamples": 50, "niches": 3, "users": 5}'::jsonb
  WHEN 'enterprise' THEN '{"contentGenerations": 999999, "perplexityQueries": 999999, "voiceTrainingSamples": 999999, "niches": 999999, "users": 25}'::jsonb
  ELSE '{"contentGenerations": 50, "perplexityQueries": 0, "voiceTrainingSamples": 10, "niches": 1, "users": 1}'::jsonb
END
WHERE usage_limits IS NULL;