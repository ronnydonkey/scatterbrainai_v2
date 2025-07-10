-- Create content scheduling table
CREATE TABLE public.content_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_suggestion_id UUID REFERENCES public.content_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  
  -- Scheduling details
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', 'instagram', etc.
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed', 'cancelled'
  
  -- Platform-specific content
  platform_content TEXT, -- Platform-specific formatted content
  platform_settings JSONB DEFAULT '{}', -- Platform-specific settings (hashtags, mentions, etc.)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Recurring schedule settings
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB DEFAULT '{}' -- {type: 'weekly', interval: 1, days: ['monday', 'wednesday']}
);

-- Enable RLS
ALTER TABLE public.content_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their organization's scheduled content" 
ON public.content_schedule 
FOR SELECT 
USING (organization_id IN ( 
  SELECT profiles.organization_id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create scheduled content" 
ON public.content_schedule 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  organization_id IN ( 
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their scheduled content" 
ON public.content_schedule 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their scheduled content" 
ON public.content_schedule 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_content_schedule_updated_at
BEFORE UPDATE ON public.content_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_content_schedule_user_org ON public.content_schedule(user_id, organization_id);
CREATE INDEX idx_content_schedule_scheduled_for ON public.content_schedule(scheduled_for);
CREATE INDEX idx_content_schedule_status ON public.content_schedule(status);
CREATE INDEX idx_content_schedule_platform ON public.content_schedule(platform);