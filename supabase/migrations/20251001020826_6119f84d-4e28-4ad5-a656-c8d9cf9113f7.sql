-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add moderation columns to comments
ALTER TABLE public.comments 
ADD COLUMN is_hidden BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN hidden_by UUID REFERENCES auth.users(id),
ADD COLUMN hidden_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN hidden_reason TEXT;

-- Add moderation columns to companies
ALTER TABLE public.companies
ADD COLUMN is_verified BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN is_hidden BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN hidden_by UUID REFERENCES auth.users(id),
ADD COLUMN hidden_at TIMESTAMP WITH TIME ZONE;

-- Update comments RLS to hide blocked comments from regular users
DROP POLICY "Anyone can view comments" ON public.comments;
CREATE POLICY "Users can view non-hidden comments"
  ON public.comments FOR SELECT
  USING (
    NOT is_hidden OR public.has_role(auth.uid(), 'admin')
  );

-- Update companies RLS to hide blocked companies
DROP POLICY "Anyone can view companies" ON public.companies;
CREATE POLICY "Users can view non-hidden companies"
  ON public.companies FOR SELECT
  USING (
    NOT is_hidden OR public.has_role(auth.uid(), 'admin')
  );

-- Add admin policies for comments
CREATE POLICY "Admins can update any comment"
  ON public.comments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policies for companies
CREATE POLICY "Admins can update any company"
  ON public.companies FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any company"
  ON public.companies FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create moderation_logs table for tracking admin actions
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs"
  ON public.moderation_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert moderation logs"
  ON public.moderation_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));