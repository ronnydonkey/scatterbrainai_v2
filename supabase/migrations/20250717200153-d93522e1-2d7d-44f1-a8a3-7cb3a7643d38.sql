-- Fix role escalation vulnerability: prevent users from updating their own role
-- Create a new policy that allows only organization owners to update user roles
CREATE POLICY "Only organization owners can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Allow users to update their own profile except for the role field
  (auth.uid() = user_id AND OLD.role = NEW.role) OR
  -- Allow organization owners to update any user's role in their organization
  (organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  ))
);

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Add a separate policy for non-role profile updates
CREATE POLICY "Users can update their own profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  OLD.role = NEW.role AND 
  OLD.organization_id = NEW.organization_id
);

-- Add validation to ensure role changes are properly authorized
CREATE OR REPLACE FUNCTION public.validate_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role != NEW.role THEN
    -- Check if the current user is an owner of the organization
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND organization_id = NEW.organization_id 
      AND role = 'owner'
    ) THEN
      RAISE EXCEPTION 'Only organization owners can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role validation
CREATE TRIGGER validate_role_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_update();