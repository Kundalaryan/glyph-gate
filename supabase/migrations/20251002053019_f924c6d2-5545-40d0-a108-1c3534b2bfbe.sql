-- Add AI context field to posts table
ALTER TABLE public.posts 
ADD COLUMN ai_context TEXT,
ADD COLUMN ai_analyzed_at TIMESTAMP WITH TIME ZONE;