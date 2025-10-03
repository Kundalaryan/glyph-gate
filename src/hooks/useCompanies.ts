import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  tier: string;
  average_rating: number;
  post_count: number;
  is_verified?: boolean;
  is_hidden?: boolean;
  verified_by?: string;
  verified_at?: string;
  hidden_by?: string;
  hidden_at?: string;
  address?: string;
  company_type?: 'product' | 'service';
  timings?: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies((data || []).map(company => ({
        ...company,
        company_type: company.company_type as 'product' | 'service' | undefined
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, error, refetch: fetchCompanies };
}