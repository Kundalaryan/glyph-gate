import { ChevronUp, ChevronDown, MessageCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Post } from "@/data/sampleData";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
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
            <span className="font-medium text-brand">{post.companyName}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeAgo(post.createdAt)}
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
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-sentiment-positive">
              <ChevronUp className="w-4 h-4" />
              <span className="ml-1 text-sm">{post.upvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-sentiment-negative">
              <ChevronDown className="w-4 h-4" />
              <span className="ml-1 text-sm">{post.downvotes}</span>
            </Button>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">{post.commentCount} comments</span>
          </div>
        </div>
      </div>
    </Card>
  );
}