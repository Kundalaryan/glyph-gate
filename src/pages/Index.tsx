import { useState } from "react";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, ThumbsUp, X } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useCompanies } from "@/hooks/useCompanies";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { AdvancedFilters, FilterState } from "@/components/AdvancedFilters";
import { TrendingCompanies } from "@/components/TrendingCompanies";
import { TagCloud } from "@/components/TagCloud";

const Index = () => {
  const { posts, loading, refetch } = usePosts();
  const { stats } = usePlatformStats();
  const { companies } = useCompanies();
  const navigate = useNavigate();
  const [selectedFeed, setSelectedFeed] = useState("trending");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    sentiment: [],
    dateRange: {},
    locations: [],
    industries: [],
    companySizes: [],
  });

  // Extract unique locations and industries for filters
  const availableLocations = Array.from(new Set(companies.map(c => c.location)));
  const availableIndustries = Array.from(new Set(companies.map(c => c.industry)));

  // Apply all filters
  const filteredPosts = posts.filter(post => {
    // Tag filter
    if (selectedTag && !post.tags.includes(selectedTag)) return false;
    
    // Sentiment filter
    if (filters.sentiment.length > 0 && !filters.sentiment.includes(post.sentiment)) return false;
    
    // Date range filter
    if (filters.dateRange.from) {
      const postDate = new Date(post.created_at);
      if (postDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && postDate > filters.dateRange.to) return false;
    }
    
    // Location filter
    if (filters.locations.length > 0) {
      const company = companies.find(c => c.id === post.company_id);
      if (!company || !filters.locations.includes(company.location)) return false;
    }
    
    // Industry filter
    if (filters.industries.length > 0) {
      const company = companies.find(c => c.id === post.company_id);
      if (!company || !filters.industries.includes(company.industry)) return false;
    }
    
    // Company size filter (using tier as proxy)
    if (filters.companySizes.length > 0) {
      const company = companies.find(c => c.id === post.company_id);
      if (!company || !filters.companySizes.includes(company.tier)) return false;
    }
    
    return true;
  });

  const sortedPosts = {
    trending: [...filteredPosts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)),
    recent: [...filteredPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    popular: [...filteredPosts].sort((a, b) => b.upvotes - a.upvotes)
  };

  const topTags = ["work-life-balance", "management", "compensation", "culture", "remote-work", "learning"];

  const clearAllFilters = () => {
    setSelectedTag(null);
    setFilters({
      sentiment: [],
      dateRange: {},
      locations: [],
      industries: [],
      companySizes: [],
    });
  };

  const hasActiveFilters = selectedTag || 
    filters.sentiment.length > 0 || 
    filters.locations.length > 0 || 
    filters.industries.length > 0 || 
    filters.companySizes.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Company Reviews & Discussions</h1>
                  <p className="text-muted-foreground">
                    Anonymous insights from employees across the industry
                  </p>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-3 mt-4">
                <AdvancedFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  availableLocations={availableLocations}
                  availableIndustries={availableIndustries}
                />
                
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
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
                        post={post} 
                        onAnalysisComplete={refetch}
                        onTagClick={setSelectedTag}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-4">
                    {sortedPosts.recent.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onAnalysisComplete={refetch}
                        onTagClick={setSelectedTag}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="popular" className="space-y-4">
                    {sortedPosts.popular.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onAnalysisComplete={refetch}
                        onTagClick={setSelectedTag}
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
              {/* Trending Companies */}
              <TrendingCompanies period="week" limit={5} />

              {/* Tag Cloud */}
              <TagCloud 
                onTagClick={setSelectedTag} 
                selectedTag={selectedTag}
                limit={30}
              />

              {/* Popular Topics (keeping original for backward compatibility) */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-brand hover:text-brand-foreground transition-colors"
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
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
                    <span className="font-medium">{stats.totalCompanies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Comments</span>
                    <span className="font-medium">{stats.totalComments}</span>
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
      
      <Footer />
    </div>
  );
};

export default Index;