import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  postCount: number;
  commentCount: number;
  totalUpvotes: number;
  companiesReviewed: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    postCount: 0,
    commentCount: 0,
    totalUpvotes: 0,
    companiesReviewed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch post count and total upvotes
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, upvotes, company_id')
        .eq('user_id', user.id);

      if (postsError) throw postsError;

      // Fetch comment count
      const { count: commentCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (commentsError) throw commentsError;

      const totalUpvotes = posts?.reduce((sum, post) => sum + (post.upvotes || 0), 0) || 0;
      const uniqueCompanies = new Set(posts?.map(p => p.company_id)).size;

      setStats({
        postCount: posts?.length || 0,
        commentCount: commentCount || 0,
        totalUpvotes,
        companiesReviewed: uniqueCompanies
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
