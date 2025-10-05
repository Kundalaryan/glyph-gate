import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { usePosts } from "@/hooks/usePosts";
import { useComments } from "@/hooks/useComments";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCompanyFollows } from "@/hooks/useCompanyFollows";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ThumbsUp, Building2, FileText, Bookmark, Bell } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/hooks/usePosts";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useUserStats();
  const { posts: allPosts, loading: postsLoading } = usePosts();
  const { bookmarkedPosts } = useBookmarks();
  const { followedCompanies } = useCompanyFollows();
  const [bookmarkedPostsData, setBookmarkedPostsData] = useState<Post[]>([]);
  const [followedCompaniesData, setFollowedCompaniesData] = useState<any[]>([]);

  useEffect(() => {
    if (bookmarkedPosts.size > 0) {
      fetchBookmarkedPosts();
    }
  }, [bookmarkedPosts]);

  useEffect(() => {
    if (followedCompanies.size > 0) {
      fetchFollowedCompanies();
    }
  }, [followedCompanies]);

  const fetchBookmarkedPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('id', Array.from(bookmarkedPosts))
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookmarkedPostsData(data.map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'negative' | 'neutral'
      })));
    }
  };

  const fetchFollowedCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .in('id', Array.from(followedCompanies));

    if (!error && data) {
      setFollowedCompaniesData(data);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-6" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const myPosts = allPosts.filter(post => post.user_id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your contributions and manage your activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.postCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Your reviews shared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.commentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Discussions joined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.totalUpvotes}</div>
              <p className="text-xs text-muted-foreground mt-1">People found you helpful</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.companiesReviewed}</div>
              <p className="text-xs text-muted-foreground mt-1">Companies reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different content */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">
              <FileText className="w-4 h-4 mr-2" />
              My Posts
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarks ({bookmarkedPosts.size})
            </TabsTrigger>
            <TabsTrigger value="following">
              <Bell className="w-4 h-4 mr-2" />
              Following ({followedCompanies.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {postsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : myPosts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  You haven't created any posts yet. Share your experience!
                </CardContent>
              </Card>
            ) : (
              myPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {bookmarkedPostsData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No bookmarked posts yet. Save posts to read them later!
                </CardContent>
              </Card>
            ) : (
              bookmarkedPostsData.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {followedCompaniesData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Not following any companies yet. Follow companies to get updates!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followedCompaniesData.map(company => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{company.industry}</p>
                        </div>
                        <Badge variant="secondary">{company.tier}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{company.location}</span>
                        <span>•</span>
                        <span>{company.post_count} reviews</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
