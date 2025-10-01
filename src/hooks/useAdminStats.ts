import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalCompanies: number;
  pendingCompanies: number;
  hiddenComments: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalCompanies: 0,
    pendingCompanies: 0,
    hiddenComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get post count
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Get comment count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Get company count
      const { count: companyCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Get pending companies
      const { count: pendingCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)
        .eq('is_hidden', false);

      // Get hidden comments
      const { count: hiddenCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_hidden', true);

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalComments: commentCount || 0,
        totalCompanies: companyCount || 0,
        pendingCompanies: pendingCount || 0,
        hiddenComments: hiddenCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
