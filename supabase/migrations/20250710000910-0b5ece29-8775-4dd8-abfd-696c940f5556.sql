-- Create thoughts table for user idea capture
CREATE TABLE public.thoughts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mood TEXT, -- happy, frustrated, excited, thoughtful, etc.
  context TEXT, -- work, personal, inspiration, etc.
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own thoughts" 
ON public.thoughts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND organization_id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own thoughts" 
ON public.thoughts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own thoughts" 
ON public.thoughts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thoughts" 
ON public.thoughts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_thoughts_user_id ON public.thoughts(user_id);
CREATE INDEX idx_thoughts_organization_id ON public.thoughts(organization_id);
CREATE INDEX idx_thoughts_created_at ON public.thoughts(created_at DESC);
CREATE INDEX idx_thoughts_is_processed ON public.thoughts(is_processed);

-- Create trigger for updated_at
CREATE TRIGGER update_thoughts_updated_at
  BEFORE UPDATE ON public.thoughts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();