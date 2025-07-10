-- Update the foreign key constraint to set thought_id to NULL when a thought is deleted
-- First, drop the existing constraint
ALTER TABLE public.content_suggestions 
DROP CONSTRAINT IF EXISTS content_suggestions_thought_id_fkey;

-- Add the new constraint with ON DELETE SET NULL
ALTER TABLE public.content_suggestions 
ADD CONSTRAINT content_suggestions_thought_id_fkey 
FOREIGN KEY (thought_id) 
REFERENCES public.thoughts(id) 
ON DELETE SET NULL;