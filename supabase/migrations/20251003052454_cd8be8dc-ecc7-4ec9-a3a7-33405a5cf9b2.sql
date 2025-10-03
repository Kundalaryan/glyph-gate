-- Add new fields to companies table
ALTER TABLE public.companies 
ADD COLUMN address text,
ADD COLUMN company_type text CHECK (company_type IN ('product', 'service')),
ADD COLUMN timings text;

-- Update RLS policy to allow authenticated users to insert companies
-- (the existing policy already allows this, but let's make it explicit)
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);