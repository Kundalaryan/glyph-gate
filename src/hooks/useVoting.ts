import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Vote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
}

export function useVoting(postId: string) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && postId) {
      fetchUserVote();
    }
  }, [user, postId]);

  const fetchUserVote = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserVote(data?.vote_type as 'upvote' | 'downvote' || null);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const vote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    setLoading(true);
    try {
      if (userVote === voteType) {
        // Remove vote if clicking same button
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserVote(null);
        toast.success('Vote removed');
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) throw error;
        setUserVote(voteType);
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}`);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    userVote,
    vote,
    loading
  };
}