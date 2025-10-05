import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCompanyFollows() {
  const { user } = useAuth();
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFollows();
    }
  }, [user]);

  const fetchFollows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('company_follows')
        .select('company_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFollowedCompanies(new Set(data?.map(f => f.company_id) || []));
    } catch (error) {
      console.error('Error fetching follows:', error);
    }
  };

  const toggleFollow = async (companyId: string) => {
    if (!user) {
      toast.error('Please log in to follow companies');
      return;
    }

    setLoading(true);
    try {
      const isFollowing = followedCompanies.has(companyId);

      if (isFollowing) {
        const { error } = await supabase
          .from('company_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('company_id', companyId);

        if (error) throw error;
        
        setFollowedCompanies(prev => {
          const newSet = new Set(prev);
          newSet.delete(companyId);
          return newSet;
        });
        toast.success('Unfollowed company');
      } else {
        const { error } = await supabase
          .from('company_follows')
          .insert({ user_id: user.id, company_id: companyId });

        if (error) throw error;
        
        setFollowedCompanies(prev => new Set(prev).add(companyId));
        toast.success('Following company');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow');
    } finally {
      setLoading(false);
    }
  };

  return {
    followedCompanies,
    toggleFollow,
    loading,
    refetch: fetchFollows
  };
}
