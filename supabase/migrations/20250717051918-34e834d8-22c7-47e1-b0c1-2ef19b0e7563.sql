-- Create a profile for the existing user who has thoughts
-- First, ensure the organization exists
INSERT INTO public.profiles (
  user_id, 
  display_name,
  first_name,
  organization_id,
  role
) 
SELECT 
  '19945897-3180-4bee-ad7a-0ca2d3d7fef1'::uuid,
  'Aaron Greenberg',
  'Aaron',
  'cda56d9b-63a2-4d64-b37f-e013d24e25c5'::uuid,
  'owner'::public.user_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '19945897-3180-4bee-ad7a-0ca2d3d7fef1'::uuid
);