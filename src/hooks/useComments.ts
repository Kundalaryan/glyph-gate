import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  display_name?: string;
  is_hidden?: boolean;
  hidden_by?: string;
  hidden_at?: string;
  hidden_reason?: string;
}

export function useComments(postId?: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get display names separately for non-anonymous comments
      const commentsWithNames = await Promise.all(
        data.map(async (comment) => {
          if (comment.is_anonymous || !comment.user_id) {
            return { ...comment, display_name: null };
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', comment.user_id)
            .maybeSingle();
            
          return { 
            ...comment, 
            display_name: profile?.display_name 
          };
        })
      );

      setComments(commentsWithNames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, isAnonymous: boolean) => {
    if (!user || !postId) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: isAnonymous ? null : user.id,
          content: content.trim(),
          is_anonymous: isAnonymous
        });

      if (error) throw error;
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return { comments, loading, error, addComment, refetch: fetchComments };
}