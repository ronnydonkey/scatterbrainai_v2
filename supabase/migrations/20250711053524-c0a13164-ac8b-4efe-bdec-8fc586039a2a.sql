-- Create missing enums that are referenced in the database functions
CREATE TYPE public.niche_type AS ENUM (
    'astrology',
    'fitness', 
    'productivity',
    'business',
    'wellness',
    'finance',
    'technology',
    'lifestyle'
);

CREATE TYPE public.user_role AS ENUM (
    'owner',
    'admin', 
    'creator',
    'viewer'
);