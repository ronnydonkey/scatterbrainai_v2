-- Create a default organization for existing users without one
-- and update trigger to auto-create organizations for new users

-- First, create a default organization for users who don't have one
INSERT INTO organizations (name, niche, subscription_tier, max_users, max_content_generations)
SELECT 
  'Personal Organization',
  'lifestyle'::niche_type,
  'starter',
  1,
  50
WHERE NOT EXISTS (
  SELECT 1 FROM organizations 
  WHERE id IN (SELECT organization_id FROM profiles WHERE organization_id IS NOT NULL)
);

-- Get the organization ID we just created (or existing one)
DO $$
DECLARE
  default_org_id uuid;
BEGIN
  -- Get or create a default organization
  INSERT INTO organizations (name, niche, subscription_tier, max_users, max_content_generations)
  VALUES ('Personal Organization', 'lifestyle'::niche_type, 'starter', 1, 50)
  ON CONFLICT DO NOTHING
  RETURNING id INTO default_org_id;
  
  -- If no ID was returned (conflict), get the existing one
  IF default_org_id IS NULL THEN
    SELECT id INTO default_org_id 
    FROM organizations 
    WHERE name = 'Personal Organization' 
    LIMIT 1;
  END IF;
  
  -- Update all profiles without an organization
  UPDATE profiles 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
END $$;

-- Update the handle_new_user function to automatically create organizations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a personal organization for the new user
  INSERT INTO public.organizations (name, niche, subscription_tier, max_users, max_content_generations)
  VALUES (
    COALESCE(new.raw_user_meta_data ->> 'display_name', 'Personal') || '''s Organization',
    'lifestyle'::niche_type,
    'starter',
    1,
    50
  )
  RETURNING id INTO new_org_id;
  
  -- Insert the user profile with the organization
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    organization_id,
    role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new_org_id,
    'owner'::user_role
  );
  
  RETURN new;
END;
$$;