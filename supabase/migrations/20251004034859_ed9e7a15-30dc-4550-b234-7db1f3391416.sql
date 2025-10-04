-- Add check constraints to ensure anonymous posts/comments have null user_id
ALTER TABLE public.posts 
ADD CONSTRAINT anonymous_posts_no_user CHECK (
  (is_anonymous = false) OR (is_anonymous = true AND user_id IS NULL)
);

ALTER TABLE public.comments 
ADD CONSTRAINT anonymous_comments_no_user CHECK (
  (is_anonymous = false) OR (is_anonymous = true AND user_id IS NULL)
);

-- Create secure views that never expose user_id for anonymous content
CREATE OR REPLACE VIEW public.posts_secure AS
SELECT 
  id,
  title,
  content,
  company_id,
  company_name,
  CASE 
    WHEN is_anonymous = true THEN NULL 
    ELSE user_id 
  END as user_id,
  sentiment,
  tags,
  upvotes,
  downvotes,
  comment_count,
  is_anonymous,
  created_at,
  updated_at,
  ai_context,
  ai_analyzed_at
FROM public.posts;

CREATE OR REPLACE VIEW public.comments_secure AS
SELECT 
  id,
  post_id,
  content,
  CASE 
    WHEN is_anonymous = true THEN NULL 
    ELSE user_id 
  END as user_id,
  is_anonymous,
  is_hidden,
  hidden_by,
  hidden_at,
  hidden_reason,
  created_at,
  updated_at
FROM public.comments;

-- Grant access to the secure views
GRANT SELECT ON public.posts_secure TO authenticated;
GRANT SELECT ON public.posts_secure TO anon;
GRANT SELECT ON public.comments_secure TO authenticated;
GRANT SELECT ON public.comments_secure TO anon;

-- Add RLS to secure views
ALTER VIEW public.posts_secure SET (security_invoker = on);
ALTER VIEW public.comments_secure SET (security_invoker = on);

-- Update votes table RLS to prevent tracking users
DROP POLICY IF EXISTS "Users can view all votes" ON public.votes;
CREATE POLICY "Users can view their own votes only" 
ON public.votes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure moderation logs don't expose anonymous user identity
COMMENT ON TABLE public.posts IS 'Posts table - user_id must be NULL for anonymous posts';
COMMENT ON TABLE public.comments IS 'Comments table - user_id must be NULL for anonymous comments';
COMMENT ON COLUMN public.posts.user_id IS 'User ID - MUST be NULL for anonymous posts to preserve anonymity';
COMMENT ON COLUMN public.comments.user_id IS 'User ID - MUST be NULL for anonymous comments to preserve anonymity';