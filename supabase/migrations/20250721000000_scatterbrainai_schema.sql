-- ScatterbrainAI Database Schema
-- Migration: 20250721000000_scatterbrainai_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    total_insights INTEGER DEFAULT 0,
    adaptation_level DECIMAL(3,2) DEFAULT 0.0,
    top_interests JSONB DEFAULT '[]'::jsonb,
    preferred_sources JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thoughts table (user's original thoughts)
CREATE TABLE IF NOT EXISTS public.thoughts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    word_count INTEGER,
    sentiment TEXT,
    complexity TEXT,
    topics TEXT[],
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights table (AI-generated insights from thoughts)
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE,
    synthesis_id TEXT, -- From API response
    key_themes JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    content_suggestions JSONB DEFAULT '{}'::jsonb,
    research_suggestions JSONB DEFAULT '[]'::jsonb,
    calendar_blocks JSONB DEFAULT '[]'::jsonb,
    detected_topics JSONB DEFAULT '[]'::jsonb,
    smart_sources JSONB DEFAULT '{}'::jsonb,
    processing_time DECIMAL(10,3),
    confidence_score DECIMAL(3,2),
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content generations table (generated social content)
CREATE TABLE IF NOT EXISTS public.content_generations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES public.insights(id) ON DELETE CASCADE,
    thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE,
    format TEXT NOT NULL CHECK (format IN ('twitter', 'linkedin', 'instagram', 'newsletter', 'blog')),
    content TEXT NOT NULL,
    hashtags TEXT[],
    engagement_prediction DECIMAL(3,2),
    word_count INTEGER,
    estimated_views INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User learning profiles (for adaptive intelligence)
CREATE TABLE IF NOT EXISTS public.user_learning_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    topic_frequency JSONB DEFAULT '{}'::jsonb,
    engagement_data JSONB DEFAULT '[]'::jsonb,
    learning_preferences JSONB DEFAULT '{}'::jsonb,
    interaction_patterns JSONB DEFAULT '{}'::jsonb,
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advisory sessions (when users consult AI advisors)
CREATE TABLE IF NOT EXISTS public.advisory_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE,
    selected_advisors JSONB DEFAULT '[]'::jsonb,
    advisor_question TEXT,
    advisor_responses JSONB DEFAULT '[]'::jsonb,
    synthesis_result JSONB,
    session_duration INTEGER, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions (for analytics)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    pages_visited INTEGER DEFAULT 1,
    thoughts_created INTEGER DEFAULT 0,
    insights_generated INTEGER DEFAULT 0,
    content_created INTEGER DEFAULT 0
);

-- Favorites/Gallery items
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('thought', 'insight', 'content')),
    item_id UUID NOT NULL,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON public.thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON public.thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_thought_id ON public.insights(thought_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON public.insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON public.content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_format ON public.content_generations(format);
CREATE INDEX IF NOT EXISTS idx_advisory_sessions_user_id ON public.advisory_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON public.favorites(item_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_thoughts
    BEFORE UPDATE ON public.thoughts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_insights
    BEFORE UPDATE ON public.insights
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_content_generations
    BEFORE UPDATE ON public.content_generations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_learning_profiles
    BEFORE UPDATE ON public.user_learning_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_advisory_sessions
    BEFORE UPDATE ON public.advisory_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Thoughts policies
CREATE POLICY "Users can view own thoughts" ON public.thoughts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thoughts" ON public.thoughts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thoughts" ON public.thoughts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thoughts" ON public.thoughts
    FOR DELETE USING (auth.uid() = user_id);

-- Insights policies
CREATE POLICY "Users can view own insights" ON public.insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON public.insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.insights
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.insights
    FOR DELETE USING (auth.uid() = user_id);

-- Content generations policies
CREATE POLICY "Users can view own content" ON public.content_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content" ON public.content_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content" ON public.content_generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content" ON public.content_generations
    FOR DELETE USING (auth.uid() = user_id);

-- User learning profiles policies
CREATE POLICY "Users can view own learning profile" ON public.user_learning_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning profile" ON public.user_learning_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning profile" ON public.user_learning_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Advisory sessions policies
CREATE POLICY "Users can view own advisory sessions" ON public.advisory_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own advisory sessions" ON public.advisory_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own advisory sessions" ON public.advisory_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own advisory sessions" ON public.advisory_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON public.favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'display_name'
    );
    
    INSERT INTO public.user_learning_profiles (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile stats
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'insights' AND TG_OP = 'INSERT' THEN
        UPDATE public.user_profiles 
        SET 
            total_insights = total_insights + 1,
            adaptation_level = LEAST(1.0, (total_insights + 1) / 20.0)
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user stats when insights are created
CREATE TRIGGER update_user_stats_on_insight
    AFTER INSERT ON public.insights
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant service_role full access for Edge Functions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for full-text search on thoughts content
CREATE INDEX IF NOT EXISTS idx_thoughts_content_search 
ON public.thoughts USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_insights_themes_search 
ON public.insights USING gin((key_themes::text));

-- View for user dashboard analytics
CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    up.id as user_id,
    up.display_name,
    up.total_insights,
    up.adaptation_level,
    COUNT(DISTINCT t.id) as total_thoughts,
    COUNT(DISTINCT cg.id) as total_content_generated,
    COUNT(DISTINCT as_.id) as total_advisory_sessions,
    COALESCE(AVG(i.confidence_score), 0) as avg_confidence_score,
    COUNT(DISTINCT f.id) as total_favorites
FROM public.user_profiles up
LEFT JOIN public.thoughts t ON up.id = t.user_id
LEFT JOIN public.insights i ON up.id = i.user_id
LEFT JOIN public.content_generations cg ON up.id = cg.user_id
LEFT JOIN public.advisory_sessions as_ ON up.id = as_.user_id
LEFT JOIN public.favorites f ON up.id = f.user_id
GROUP BY up.id, up.display_name, up.total_insights, up.adaptation_level;

-- Grant access to the view
GRANT SELECT ON public.user_dashboard_stats TO anon, authenticated, service_role;

COMMENT ON TABLE public.user_profiles IS 'Extended user profiles with subscription and preference data';
COMMENT ON TABLE public.thoughts IS 'Original user thoughts/inputs for analysis';
COMMENT ON TABLE public.insights IS 'AI-generated insights and analysis results';
COMMENT ON TABLE public.content_generations IS 'Generated social media content from insights';
COMMENT ON TABLE public.user_learning_profiles IS 'Adaptive intelligence and learning data';
COMMENT ON TABLE public.advisory_sessions IS 'AI advisor consultation sessions';
COMMENT ON TABLE public.user_sessions IS 'User activity sessions for analytics';
COMMENT ON TABLE public.favorites IS 'User-favorited thoughts, insights, and content';