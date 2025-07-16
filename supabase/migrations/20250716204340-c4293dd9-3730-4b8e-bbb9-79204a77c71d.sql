-- Fix search path security for all functions
-- This prevents potential SQL injection attacks by ensuring functions use a fixed search path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a personal organization for the new user
  INSERT INTO public.organizations (name, niche, subscription_tier, max_users, max_content_generations)
  VALUES (
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'first_name', 'Personal') || '''s Organization',
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
    first_name,
    organization_id,
    role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'first_name',
    new_org_id,
    'owner'::public.user_role
  );
  
  RETURN new;
END;
$function$;

-- Fix get_user_organization_id function
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  org_id uuid;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  RETURN org_id;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix cleanup_expired_trends function
CREATE OR REPLACE FUNCTION public.cleanup_expired_trends()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.trending_topics 
  WHERE expires_at < now() - INTERVAL '1 day';
END;
$function$;