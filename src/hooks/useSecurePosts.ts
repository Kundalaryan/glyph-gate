import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { analyzeSentiment } from '@/utils/sentimentAnalysis';
import { toast } from 'sonner';

export interface CreatePostData {
  title: string;
  content: string;
  companyId: string;
  companyName: string;
  tags: string[];
  isAnonymous: boolean;
}

export function useSecurePosts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createPost = async (postData: CreatePostData) => {
    if (!user) {
      toast.error('Please log in to create a post');
      return;
    }

    setLoading(true);
    try {
      // Analyze sentiment automatically
      const sentiment = analyzeSentiment(`${postData.title} ${postData.content}`);
      
      // For truly anonymous posts, don't store user_id at all
      const { error } = await supabase
        .from('posts')
        .insert({
          title: postData.title.trim(),
          content: postData.content.trim(),
          company_id: postData.companyId,
          company_name: postData.companyName,
          user_id: postData.isAnonymous ? null : user.id, // Critical: null for anonymous posts
          sentiment,
          tags: postData.tags,
          is_anonymous: postData.isAnonymous,
          upvotes: 0,
          downvotes: 0,
          comment_count: 0
        });

      if (error) throw error;
      
      toast.success('Post created successfully');
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    loading
  };
}