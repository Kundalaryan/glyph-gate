import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ThumbsUp, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/hooks/usePosts";

interface RelatedPostsProps {
  currentPostId: string;
  tags: string[];
  companyId?: string;
  onPostClick?: (postId: string) => void;
  limit?: number;
}

export function RelatedPosts({
  currentPostId,
  tags,
  companyId,
  onPostClick,
  limit = 5,
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedPosts();
  }, [currentPostId, tags, companyId]);

  const fetchRelatedPosts = async () => {
    try {
      setLoading(true);
      
      // Strategy: Find posts with similar tags or from same company
      let query = supabase
        .from('posts')
        .select('*')
        .neq('id', currentPostId)
        .order('created_at', { ascending: false })
        .limit(limit * 3); // Fetch more to filter

      const { data: posts, error } = await query;
      
      if (error) throw error;

      if (!posts || posts.length === 0) {
        setRelatedPosts([]);
        return;
      }

      // Score posts by relevance
      const scoredPosts = posts.map(post => {
        let score = 0;
        
        // Same company gets high score
        if (companyId && post.company_id === companyId) {
          score += 10;
        }
        
        // Count matching tags
        const matchingTags = post.tags?.filter((tag: string) => tags.includes(tag)).length || 0;
        score += matchingTags * 5;
        
        // Boost popular posts slightly
        score += Math.min((post.upvotes || 0) / 10, 3);
        
        // Boost posts with engagement
        score += Math.min((post.comment_count || 0) / 5, 2);
        
        return {
          ...post,
          relevanceScore: score,
          sentiment: post.sentiment as 'positive' | 'negative' | 'neutral'
        };
      });

      // Sort by score and take top N
      const sorted = scoredPosts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .filter(p => p.relevanceScore > 0)
        .slice(0, limit);

      setRelatedPosts(sorted);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-brand" />
          Related Posts
        </h3>
        <p className="text-sm text-muted-foreground">Finding similar posts...</p>
      </Card>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-brand" />
        Related Posts
      </h3>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <div
            key={post.id}
            className="cursor-pointer hover:bg-accent/50 p-3 rounded-md transition-colors border border-transparent hover:border-brand/20"
            onClick={() => onPostClick?.(post.id)}
          >
            <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
              {post.title}
            </h4>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {post.upvotes || 0}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {post.comment_count || 0}
                </span>
              </div>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
