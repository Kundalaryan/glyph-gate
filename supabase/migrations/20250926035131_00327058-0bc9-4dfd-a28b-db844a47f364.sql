-- Create votes table for secure voting
CREATE TABLE public.votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL,
  user_id uuid,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for votes
CREATE POLICY "Users can view all votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comments  
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION public.update_post_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  upvote_count integer;
  downvote_count integer;
BEGIN
  -- Get current vote counts for the post
  SELECT 
    COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END), 0)
  INTO upvote_count, downvote_count
  FROM public.votes
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);
  
  -- Update the post with new counts
  UPDATE public.posts 
  SET 
    upvotes = upvote_count,
    downvotes = downvote_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
DECLARE
  comment_count integer;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM public.comments
  WHERE post_id = COALESCE(NEW.post_id, OLD.post_id);
  
  UPDATE public.posts 
  SET 
    comment_count = comment_count,
    updated_at = now()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for vote count updates
CREATE TRIGGER update_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_vote_counts();

-- Triggers for comment count updates
CREATE TRIGGER update_comments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- Add trigger for comment timestamps
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();