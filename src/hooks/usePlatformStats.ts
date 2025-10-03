import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  totalCompanies: number;
  totalUsers: number;
  totalComments: number;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalCompanies: 0,
    totalUsers: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch total companies (non-hidden)
        const { count: companiesCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('is_hidden', false);

        // Fetch total users (profiles)
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total comments (non-hidden)
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('is_hidden', false);

        setStats({
          totalCompanies: companiesCount || 0,
          totalUsers: usersCount || 0,
          totalComments: commentsCount || 0
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
