import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CreateCompanyData {
  name: string;
  industry: string;
  location: string;
  tier: string;
  address?: string;
  company_type?: 'product' | 'service';
  timings?: string;
}

export function useCreateCompany() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createCompany = async (companyData: CreateCompanyData) => {
    if (!user) {
      toast.error('Please log in to add a company');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name.trim(),
          industry: companyData.industry,
          location: companyData.location.trim(),
          tier: companyData.tier,
          address: companyData.address?.trim(),
          company_type: companyData.company_type,
          timings: companyData.timings?.trim(),
          average_rating: 0,
          post_count: 0,
          is_verified: false,
          is_hidden: false
        });

      if (error) throw error;
      
      toast.success('Company added successfully');
      return true;
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to add company. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCompany,
    loading
  };
}
