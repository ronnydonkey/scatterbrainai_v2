-- Create trending topics table
CREATE TABLE public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('reddit', 'google_trends', 'social_media', 'news')),
  topic TEXT NOT NULL,
  title TEXT,
  description TEXT,
  score FLOAT NOT NULL DEFAULT 0,
  engagement_metrics JSONB DEFAULT '{}',
  source_url TEXT,
  source_data JSONB DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  sentiment FLOAT,
  is_validated BOOLEAN DEFAULT false,
  validation_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Create content suggestions table
CREATE TABLE public.content_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trending_topic_id UUID REFERENCES public.trending_topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('email', 'tweet_thread', 'instagram_post', 'youtube_script', 'blog_post', 'social_post')),
  ai_generated_content TEXT,
  content_outline JSONB DEFAULT '{}',
  engagement_prediction FLOAT DEFAULT 0,
  voice_authenticity_score FLOAT DEFAULT 0,
  target_keywords TEXT[] DEFAULT '{}',
  suggested_tone TEXT,
  estimated_word_count INTEGER,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content performance tracking table
CREATE TABLE public.content_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content_suggestion_id UUID REFERENCES public.content_suggestions(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_content_id TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  click_through_rate FLOAT DEFAULT 0,
  revenue_attributed FLOAT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

-- Trending topics policies - users can only see their org's trends
CREATE POLICY "Users can view their organization's trending topics" 
ON public.trending_topics 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert trending topics for their org" 
ON public.trending_topics 
FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

-- Content suggestions policies - users can manage their own suggestions
CREATE POLICY "Users can view their organization's content suggestions" 
ON public.content_suggestions 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create content suggestions" 
ON public.content_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own content suggestions" 
ON public.content_suggestions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Content performance policies - organization-level access
CREATE POLICY "Users can view their organization's content performance" 
ON public.content_performance 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert content performance for their org" 
ON public.content_performance 
FOR INSERT 
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_trending_topics_org_created ON public.trending_topics(organization_id, created_at DESC);
CREATE INDEX idx_trending_topics_score ON public.trending_topics(score DESC) WHERE expires_at > now();
CREATE INDEX idx_content_suggestions_org_created ON public.content_suggestions(organization_id, created_at DESC);
CREATE INDEX idx_content_suggestions_unused ON public.content_suggestions(organization_id) WHERE is_used = false;
CREATE INDEX idx_content_performance_org_platform ON public.content_performance(organization_id, platform);

-- Create triggers for updated_at
CREATE TRIGGER update_content_suggestions_updated_at
  BEFORE UPDATE ON public.content_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up expired trending topics
CREATE OR REPLACE FUNCTION public.cleanup_expired_trends()
RETURNS void AS $$
BEGIN
  DELETE FROM public.trending_topics 
  WHERE expires_at < now() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample trending topics for testing (astrology niche)
INSERT INTO public.trending_topics (organization_id, source, topic, title, description, score, keywords, sentiment, source_data) 
SELECT 
  o.id,
  'reddit',
  'Mercury Retrograde Winter 2024',
  'Mercury Retrograde Effects on Daily Life',
  'Discussion about how Mercury retrograde is affecting communication and technology during winter season',
  85.5,
  ARRAY['mercury retrograde', 'astrology', 'winter 2024', 'communication'],
  0.3,
  '{"subreddit": "astrology", "upvotes": 247, "comments": 89, "post_id": "example123"}'::jsonb
FROM public.organizations o 
WHERE o.niche = 'astrology'
LIMIT 1;