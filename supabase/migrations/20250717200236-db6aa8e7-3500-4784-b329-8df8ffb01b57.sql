-- Fix role escalation vulnerability with correct PostgreSQL syntax
-- Drop the existing overly permissive policy first
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new policy that prevents role escalation
CREATE POLICY "Users can update their own profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Prevent users from changing their own role or organization
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()) AND
  organization_id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create a separate policy for organization owners to manage user roles
CREATE POLICY "Organization owners can manage user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Add a security function to validate critical profile changes
CREATE OR REPLACE FUNCTION public.validate_profile_security()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or organization is being changed by a non-owner
  IF (OLD.role != NEW.role OR OLD.organization_id != NEW.organization_id) THEN
    -- Check if the current user is an owner of the organization
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND organization_id = OLD.organization_id 
      AND role = 'owner'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only organization owners can change user roles or organization membership';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile security validation
DROP TRIGGER IF EXISTS validate_profile_security_trigger ON public.profiles;
CREATE TRIGGER validate_profile_security_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_security();