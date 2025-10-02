import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAIAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzePost = async (postId: string) => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-post', {
        body: { postId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('AI analysis completed');
        return data.aiContext;
      } else {
        throw new Error(data?.error || 'Failed to analyze post');
      }
    } catch (error) {
      console.error('Error analyzing post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze post');
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyzePost, analyzing };
}