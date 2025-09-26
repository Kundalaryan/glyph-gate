import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoting } from "@/hooks/useVoting";
import { cn } from "@/lib/utils";

interface PostVotingProps {
  postId: string;
  upvotes: number;
  downvotes: number;
}

export function PostVoting({ postId, upvotes, downvotes }: PostVotingProps) {
  const { userVote, vote, loading } = useVoting(postId);

  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "h-8 px-2 text-muted-foreground transition-colors",
          userVote === 'upvote' && "text-sentiment-positive bg-sentiment-positive/10",
          !userVote && "hover:text-sentiment-positive hover:bg-sentiment-positive/5"
        )}
        onClick={(e) => {
          e.stopPropagation();
          vote('upvote');
        }}
        disabled={loading}
      >
        <ChevronUp className="w-4 h-4" />
        <span className="ml-1 text-sm">{upvotes}</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "h-8 px-2 text-muted-foreground transition-colors",
          userVote === 'downvote' && "text-sentiment-negative bg-sentiment-negative/10",
          !userVote && "hover:text-sentiment-negative hover:bg-sentiment-negative/5"
        )}
        onClick={(e) => {
          e.stopPropagation();
          vote('downvote');
        }}
        disabled={loading}
      >
        <ChevronDown className="w-4 h-4" />
        <span className="ml-1 text-sm">{downvotes}</span>
      </Button>
    </div>
  );
}