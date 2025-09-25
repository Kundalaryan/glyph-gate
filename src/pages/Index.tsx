import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, ThumbsUp } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { posts, loading } = usePosts();
  const navigate = useNavigate();
  const [selectedFeed, setSelectedFeed] = useState("trending");

  const sortedPosts = {
    trending: [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)),
    recent: [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    popular: [...posts].sort((a, b) => b.upvotes - a.upvotes)
  };

  const topTags = ["work-life-balance", "management", "compensation", "culture", "remote-work", "learning"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Company Reviews & Discussions</h1>
              <p className="text-muted-foreground">
                Anonymous insights from employees across the industry
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : (
              <>
                {/* Feed Tabs */}
                <Tabs value={selectedFeed} onValueChange={setSelectedFeed} className="mb-6">
                  <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                    <TabsTrigger value="trending" className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Trending
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Recent
                    </TabsTrigger>
                    <TabsTrigger value="popular" className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Popular
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="trending" className="space-y-4">
                    {sortedPosts.trending.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={{
                          ...post,
                          companyId: post.company_id,
                          companyName: post.company_name,
                          commentCount: post.comment_count,
                          createdAt: post.created_at,
                          isAnonymous: post.is_anonymous
                        }}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-4">
                    {sortedPosts.recent.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={{
                          ...post,
                          companyId: post.company_id,
                          companyName: post.company_name,
                          commentCount: post.comment_count,
                          createdAt: post.created_at,
                          isAnonymous: post.is_anonymous
                        }}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="popular" className="space-y-4">
                    {sortedPosts.popular.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={{
                          ...post,
                          companyId: post.company_id,
                          companyName: post.company_name,
                          commentCount: post.comment_count,
                          createdAt: post.created_at,
                          isAnonymous: post.is_anonymous
                        }}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Popular Tags */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-brand hover:text-brand-foreground transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-medium">{posts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Companies</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">Growing</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-3">About CompanyVoice</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A safe space for employees to share honest company reviews and workplace discussions anonymously.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/companies')}
                >
                  Browse Companies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;