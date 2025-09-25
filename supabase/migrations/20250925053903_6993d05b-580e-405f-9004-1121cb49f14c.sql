-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Enterprise', 'Mid-Market', 'Startup')),
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for companies
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- RLS Policies for posts
CREATE POLICY "Anyone can view posts" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample companies
INSERT INTO public.companies (name, industry, location, tier, average_rating, post_count) VALUES
('TechCorp Inc.', 'Technology', 'San Francisco, CA', 'Enterprise', 4.2, 24),
('DataFlow Systems', 'Data Analytics', 'Austin, TX', 'Mid-Market', 3.8, 15),
('StartupHub', 'Consulting', 'New York, NY', 'Startup', 4.5, 8),
('CloudNine Solutions', 'Cloud Computing', 'Seattle, WA', 'Enterprise', 3.9, 31),
('InnovateLab', 'R&D', 'Boston, MA', 'Mid-Market', 4.1, 12);

-- Insert sample posts
INSERT INTO public.posts (title, content, company_id, company_name, sentiment, tags, upvotes, downvotes, comment_count, is_anonymous) VALUES
('Great work-life balance', 'The company really cares about employee wellbeing. Flexible hours and remote work options make it easy to maintain a healthy work-life balance.', 
 (SELECT id FROM public.companies WHERE name = 'TechCorp Inc.'), 'TechCorp Inc.', 'positive', ARRAY['work-life-balance', 'remote-work', 'flexible'], 15, 2, 8, false),
('Management could be better', 'While the team is great, there are some issues with middle management communication and decision-making processes.', 
 (SELECT id FROM public.companies WHERE name = 'DataFlow Systems'), 'DataFlow Systems', 'negative', ARRAY['management', 'communication'], 7, 12, 5, true),
('Amazing learning opportunities', 'Constant learning and growth opportunities. The company invests heavily in employee development and training programs.', 
 (SELECT id FROM public.companies WHERE name = 'StartupHub'), 'StartupHub', 'positive', ARRAY['learning', 'growth', 'training'], 22, 1, 12, false),
('Decent benefits package', 'The benefits are okay, not the best in the industry but covers the basics. Health insurance and 401k matching are standard.', 
 (SELECT id FROM public.companies WHERE name = 'CloudNine Solutions'), 'CloudNine Solutions', 'neutral', ARRAY['benefits', 'insurance', '401k'], 5, 3, 2, false),
('Fast-paced environment', 'Very dynamic and fast-moving workplace. Great for those who thrive under pressure, but can be overwhelming at times.', 
 (SELECT id FROM public.companies WHERE name = 'InnovateLab'), 'InnovateLab', 'neutral', ARRAY['fast-paced', 'dynamic', 'pressure'], 9, 4, 6, true);