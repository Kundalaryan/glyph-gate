import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarkedPosts(new Set(data?.map(b => b.post_id) || []));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) {
      toast.error('Please log in to bookmark posts');
      return;
    }

    setLoading(true);
    try {
      const isBookmarked = bookmarkedPosts.has(postId);

      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;
        
        setBookmarkedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        toast.success('Bookmark removed');
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, post_id: postId });

        if (error) throw error;
        
        setBookmarkedPosts(prev => new Set(prev).add(postId));
        toast.success('Post bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  return {
    bookmarkedPosts,
    toggleBookmark,
    loading,
    refetch: fetchBookmarks
  };
}
