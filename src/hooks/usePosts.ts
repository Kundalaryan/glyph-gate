import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  title: string;
  content: string;
  company_id: string;
  company_name: string;
  user_id: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_anonymous: boolean;
  created_at: string;
}

export function usePosts(companyId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts((data || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'negative' | 'neutral'
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [companyId]);

  return { posts, loading, error, refetch: fetchPosts };
}