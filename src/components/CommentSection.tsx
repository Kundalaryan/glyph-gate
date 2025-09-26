import { useState } from "react";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
  commentCount: number;
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, addComment } = useComments(postId);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(newComment, isAnonymous);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          setShowComments(!showComments);
        }}
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        <span className="text-sm">{commentCount} comments</span>
      </Button>

      {showComments && (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Add Comment Form */}
          {user && (
            <Card className="p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous" className="text-sm text-muted-foreground">
                      Comment anonymously
                    </Label>
                  </div>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.is_anonymous ? 'Anonymous' : (comment.display_name || 'User')}
                        </span>
                        {comment.is_anonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(comment.created_at)}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}