import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, MessageCircle, Users, Building, ArrowLeft, TrendingUp, Clock, ThumbsUp } from "lucide-react";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useCompanies } from "@/hooks/useCompanies";
import { usePosts } from "@/hooks/usePosts";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const [selectedTab, setSelectedTab] = useState("posts");
  const { companies, loading: companiesLoading } = useCompanies();
  const { posts: companyPosts, loading: postsLoading } = usePosts(companyId);
  
  const company = companies.find(c => c.id === companyId);
  
  if (companiesLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Company Not Found</h1>
            <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist.</p>
            <Link to="/companies">
              <Button>Back to Companies</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const sortedPosts = {
    trending: [...companyPosts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)),
    recent: [...companyPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    popular: [...companyPosts].sort((a, b) => b.upvotes - a.upvotes)
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'fortune 500':
      case 'fortune 100':
        return 'bg-brand/10 text-brand border-brand/20';
      case 'enterprise':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'startup':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const sentimentCounts = companyPosts.reduce((acc, post) => {
    acc[post.sentiment] = (acc[post.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/companies">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>

        {/* Company Hero Section */}
        <Card className="p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Company Logo */}
              <div className="w-20 h-20 bg-gradient-to-br from-brand/20 to-brand/10 rounded-xl flex items-center justify-center">
                <span className="text-brand font-bold text-2xl">
                  {company.name.charAt(0)}
                </span>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{company.name}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {company.industry}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.location}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current text-yellow-500" />
                    {company.average_rating}/5.0
                  </div>
                </div>
                <Badge variant="outline" className={getTierColor(company.tier)}>
                  {company.tier}
                </Badge>
              </div>
            </div>

            <Button className="bg-brand hover:bg-brand-hover text-brand-foreground">
              Write Review
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{company.post_count}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sentiment-positive">{sentimentCounts.positive || 0}</div>
              <div className="text-sm text-muted-foreground">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sentiment-negative">{sentimentCounts.negative || 0}</div>
              <div className="text-sm text-muted-foreground">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sentiment-neutral">{sentimentCounts.neutral || 0}</div>
              <div className="text-sm text-muted-foreground">Neutral</div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 mb-8">
            <TabsTrigger value="posts" className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Posts ({companyPosts.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {companyPosts.length > 0 ? (
              <div className="space-y-6">
                {/* Post Sorting */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-foreground">Sort by:</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Trending
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="w-4 h-4 mr-1" />
                      Recent
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Popular
                    </Button>
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                  {sortedPosts.trending.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share your experience with {company.name}</p>
                <Button className="bg-brand hover:bg-brand-hover text-brand-foreground">
                  Write First Review
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sentiment-positive">Positive Reviews</span>
                    <span className="font-medium">{sentimentCounts.positive || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sentiment-negative">Negative Reviews</span>
                    <span className="font-medium">{sentimentCounts.negative || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sentiment-neutral">Neutral Reviews</span>
                    <span className="font-medium">{sentimentCounts.neutral || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {companyPosts.flatMap(post => post.tags).filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 8).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-foreground">Industry:</span>
                  <span className="ml-2 text-muted-foreground">{company.industry}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Company Size:</span>
                  <span className="ml-2 text-muted-foreground">{company.tier}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Location:</span>
                  <span className="ml-2 text-muted-foreground">{company.location}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Overall Rating:</span>
                  <span className="ml-2 text-muted-foreground">{company.average_rating}/5.0 stars</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}