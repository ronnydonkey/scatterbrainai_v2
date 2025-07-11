-- Drop and recreate the function with explicit schema references
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a personal organization for the new user
  INSERT INTO public.organizations (name, niche, subscription_tier, max_users, max_content_generations)
  VALUES (
    COALESCE(new.raw_user_meta_data ->> 'display_name', 'Personal') || '''s Organization',
    'lifestyle'::public.niche_type,
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
    'owner'::public.user_role
  );
  
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();