-- Update agency tier organization to have proper usage limits
UPDATE organizations 
SET usage_limits = jsonb_set(
  usage_limits, 
  '{perplexityQueries}', 
  '25'::jsonb
)
WHERE subscription_tier = 'agency';