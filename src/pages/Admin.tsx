import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Building, MessageSquare, TrendingUp, TrendingDown, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useCompanies } from "@/hooks/useCompanies";
import { usePosts } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const { posts, loading: postsLoading } = usePosts();
  const { comments, loading: commentsLoading } = useComments();
  
  const [selectedTab, setSelectedTab] = useState("overview");
  const [moderationReason, setModerationReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string } | null>(null);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  const topPositivePosts = [...posts]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5);

  const topNegativePosts = [...posts]
    .sort((a, b) => b.downvotes - a.downvotes)
    .slice(0, 5);

  const handleHideComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          is_hidden: true,
          hidden_by: (await supabase.auth.getUser()).data.user?.id,
          hidden_at: new Date().toISOString(),
          hidden_reason: moderationReason || 'Moderated by admin'
        })
        .eq('id', commentId);

      if (error) throw error;

      await supabase.from('moderation_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'hide_comment',
        target_type: 'comment',
        target_id: commentId,
        reason: moderationReason
      });

      toast.success('Comment hidden successfully');
      setModerationReason("");
      setSelectedItem(null);
      refetchStats();
    } catch (error) {
      console.error('Error hiding comment:', error);
      toast.error('Failed to hide comment');
    }
  };

  const handleUnhideComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          is_hidden: false,
          hidden_by: null,
          hidden_at: null,
          hidden_reason: null
        })
        .eq('id', commentId);

      if (error) throw error;

      await supabase.from('moderation_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'unhide_comment',
        target_type: 'comment',
        target_id: commentId
      });

      toast.success('Comment restored successfully');
      refetchStats();
    } catch (error) {
      console.error('Error unhiding comment:', error);
      toast.error('Failed to restore comment');
    }
  };

  const handleVerifyCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          is_verified: true,
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (error) throw error;

      await supabase.from('moderation_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'verify_company',
        target_type: 'company',
        target_id: companyId
      });

      toast.success('Company verified successfully');
      refetchCompanies();
      refetchStats();
    } catch (error) {
      console.error('Error verifying company:', error);
      toast.error('Failed to verify company');
    }
  };

  const handleRemoveCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      await supabase.from('moderation_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'delete_company',
        target_type: 'company',
        target_id: companyId,
        reason: moderationReason
      });

      toast.success('Company removed successfully');
      setModerationReason("");
      setSelectedItem(null);
      refetchCompanies();
      refetchStats();
    } catch (error) {
      console.error('Error removing company:', error);
      toast.error('Failed to remove company');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-brand" />
            <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          </div>
          <p className="text-muted-foreground">Manage users, content, and platform activity</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-brand/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalPosts}</p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-brand/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalCompanies}</p>
                  </div>
                  <Building className="w-12 h-12 text-brand/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Companies</p>
                    <p className="text-3xl font-bold text-sentiment-neutral">{stats.pendingCompanies}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-sentiment-neutral/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Comments</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalComments}</p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-brand/20" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hidden Comments</p>
                    <p className="text-3xl font-bold text-sentiment-negative">{stats.hiddenComments}</p>
                  </div>
                  <EyeOff className="w-12 h-12 text-sentiment-negative/20" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Company Management</h2>
              <div className="space-y-4">
                {companiesLoading ? (
                  <p className="text-center text-muted-foreground">Loading companies...</p>
                ) : companies.length === 0 ? (
                  <p className="text-center text-muted-foreground">No companies found</p>
                ) : (
                  companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-foreground">{company.name}</h3>
                          {company.is_verified && (
                            <Badge variant="outline" className="bg-sentiment-positive-bg text-sentiment-positive">
                              Verified
                            </Badge>
                          )}
                          {company.is_hidden && (
                            <Badge variant="outline" className="bg-sentiment-negative-bg text-sentiment-negative">
                              Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{company.industry} • {company.location}</p>
                        <p className="text-sm text-muted-foreground">{company.post_count} posts</p>
                      </div>
                      <div className="flex space-x-2">
                        {!company.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyCompany(company.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setSelectedItem({ id: company.id, type: 'company' })}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Company</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this company? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Reason (optional)</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Enter reason for removal..."
                                  value={moderationReason}
                                  onChange={(e) => setModerationReason(e.target.value)}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => {
                                  setSelectedItem(null);
                                  setModerationReason("");
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRemoveCompany(company.id)}
                                >
                                  Remove Company
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Comment Moderation</h2>
              <div className="space-y-4">
                {commentsLoading ? (
                  <p className="text-center text-muted-foreground">Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p className="text-center text-muted-foreground">No comments found</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                          {comment.is_hidden && comment.hidden_reason && (
                            <p className="text-xs text-sentiment-negative mt-1">
                              Hidden: {comment.hidden_reason}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {comment.is_hidden ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnhideComment(comment.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Restore
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedItem({ id: comment.id, type: 'comment' })}
                                >
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Hide
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Hide Comment</DialogTitle>
                                  <DialogDescription>
                                    This comment will be hidden from regular users.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="comment-reason">Reason</Label>
                                    <Textarea
                                      id="comment-reason"
                                      placeholder="Enter reason for hiding..."
                                      value={moderationReason}
                                      onChange={(e) => setModerationReason(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => {
                                      setSelectedItem(null);
                                      setModerationReason("");
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleHideComment(comment.id)}
                                    >
                                      Hide Comment
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-sentiment-positive" />
                  Top Positive Posts
                </h2>
                <div className="space-y-3">
                  {postsLoading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : topPositivePosts.length === 0 ? (
                    <p className="text-center text-muted-foreground">No posts found</p>
                  ) : (
                    topPositivePosts.map((post) => (
                      <div key={post.id} className="p-3 border rounded-lg">
                        <h3 className="font-medium text-foreground text-sm mb-1">{post.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{post.company_name}</p>
                          <Badge variant="outline" className="bg-sentiment-positive-bg text-sentiment-positive">
                            {post.upvotes} upvotes
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-2 text-sentiment-negative" />
                  Top Negative Posts
                </h2>
                <div className="space-y-3">
                  {postsLoading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : topNegativePosts.length === 0 ? (
                    <p className="text-center text-muted-foreground">No posts found</p>
                  ) : (
                    topNegativePosts.map((post) => (
                      <div key={post.id} className="p-3 border rounded-lg">
                        <h3 className="font-medium text-foreground text-sm mb-1">{post.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{post.company_name}</p>
                          <Badge variant="outline" className="bg-sentiment-negative-bg text-sentiment-negative">
                            {post.downvotes} downvotes
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
