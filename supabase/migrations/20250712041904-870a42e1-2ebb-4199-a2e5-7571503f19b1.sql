-- Set the developer account to Agency tier for testing
-- This assumes there's only one organization currently (the developer's)
UPDATE organizations 
SET 
  subscription_tier = 'agency',
  subscription_status = 'active',
  updated_at = now()
WHERE subscription_tier IS NULL OR subscription_tier IN ('starter', 'creator', 'professional');

-- Also update any existing profiles to reflect the agency tier
UPDATE profiles 
SET 
  subscription_tier = 'agency',
  updated_at = now()
WHERE subscription_tier IS NULL OR subscription_tier IN ('starter', 'creator', 'professional');