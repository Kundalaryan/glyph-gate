import { Clock, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostVoting } from "@/components/PostVoting";
import { CommentSection } from "@/components/CommentSection";
import { AIContextCard } from "@/components/AIContextCard";
import { useBookmarks } from "@/hooks/useBookmarks";
import type { Post } from "@/hooks/usePosts";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  onAnalysisComplete?: () => void;
  onTagClick?: (tag: string) => void;
}

export function PostCard({ post, onClick, onAnalysisComplete, onTagClick }: PostCardProps) {
  const { bookmarkedPosts, toggleBookmark, loading: bookmarkLoading } = useBookmarks();
  const isBookmarked = bookmarkedPosts.has(post.id);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-sentiment-positive-bg text-sentiment-positive border-sentiment-positive/20';
      case 'negative':
        return 'bg-sentiment-negative-bg text-sentiment-negative border-sentiment-negative/20';
      default:
        return 'bg-sentiment-neutral-bg text-sentiment-neutral border-sentiment-neutral/20';
    }
  };

  return (
    <Card 
      className="p-6 hover:bg-card-hover transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-brand/30"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            <span className="font-medium text-brand">{post.company_name}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(post.created_at)}
            </div>
            <span>•</span>
            <span>Anonymous</span>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`ml-4 ${getSentimentColor(post.sentiment)} capitalize`}
        >
          {post.sentiment}
        </Badge>
      </div>

      {/* Content */}
      <p className="text-foreground/80 mb-4 line-clamp-3">
        {post.content}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="secondary" 
            className="text-xs cursor-pointer hover:bg-brand hover:text-brand-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick?.(tag);
            }}
          >
            #{tag}
          </Badge>
        ))}
      </div>

      {/* AI Context */}
      <div className="mb-4">
        <AIContextCard 
          postId={post.id}
          aiContext={post.ai_context}
          aiAnalyzedAt={post.ai_analyzed_at}
          onAnalysisComplete={onAnalysisComplete}
        />
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <PostVoting 
              postId={post.id}
              upvotes={post.upvotes}
              downvotes={post.downvotes}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(post.id);
            }}
            disabled={bookmarkLoading}
            className="gap-2"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-brand' : ''}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </Button>
        </div>

        {/* Comments Section */}
        <CommentSection 
          postId={post.id}
          commentCount={post.comment_count}
        />
      </div>
    </Card>
  );
}