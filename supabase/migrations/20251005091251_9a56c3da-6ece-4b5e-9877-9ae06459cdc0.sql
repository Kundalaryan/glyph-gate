-- Create bookmarks table for saving posts
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create company_follows table
CREATE TABLE public.company_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on company_follows
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_follows
CREATE POLICY "Users can view their own follows"
  ON public.company_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follows"
  ON public.company_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follows"
  ON public.company_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Create employee_verifications table
CREATE TABLE public.employee_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on employee_verifications
ALTER TABLE public.employee_verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_verifications
CREATE POLICY "Users can view their own verifications"
  ON public.employee_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests"
  ON public.employee_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update verifications"
  ON public.employee_verifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all verifications"
  ON public.employee_verifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'));