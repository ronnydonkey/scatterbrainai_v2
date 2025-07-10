-- Add thought_id column to content_suggestions table to link content to specific thoughts
ALTER TABLE public.content_suggestions 
ADD COLUMN thought_id uuid REFERENCES public.thoughts(id);

-- Create index for better performance when querying by thought
CREATE INDEX idx_content_suggestions_thought_id ON public.content_suggestions(thought_id);

-- Update RLS policy to ensure users can only see content suggestions linked to their thoughts
DROP POLICY IF EXISTS "Users can view their organization's content suggestions" ON public.content_suggestions;

CREATE POLICY "Users can view their organization's content suggestions" 
ON public.content_suggestions 
FOR SELECT 
USING (
  organization_id IN ( 
    SELECT profiles.organization_id
    FROM profiles
    WHERE (profiles.user_id = auth.uid())
  ) 
  AND (
    thought_id IS NULL OR 
    thought_id IN (
      SELECT id FROM public.thoughts 
      WHERE user_id = auth.uid()
    )
  )
);