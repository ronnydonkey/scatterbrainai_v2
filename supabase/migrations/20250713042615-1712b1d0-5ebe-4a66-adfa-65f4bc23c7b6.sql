-- Fix RLS policy for thoughts table - make INSERT policy simpler
DROP POLICY IF EXISTS "Users can create their own thoughts" ON public.thoughts;

CREATE POLICY "Users can create their own thoughts" 
ON public.thoughts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add a helper function to get user's organization for cleaner queries
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_id uuid;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN org_id;
END;
$$;