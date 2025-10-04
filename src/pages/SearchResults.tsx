import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/PostCard";
import { CompanyCard } from "@/components/CompanyCard";
import { Card } from "@/components/ui/card";
import { Search, FileText, Building2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/hooks/usePosts";
import { Company } from "@/hooks/useCompanies";

interface Comment {
  id: string;
  content: string;
  post_id: string;
  created_at: string;
  is_anonymous: boolean;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [posts, setPosts] = useState<Post[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setLoading(true);
    try {
      // Search posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,company_name.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      // Search companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${term}%,industry.ilike.%${term}%,location.ilike.%${term}%`)
        .order('name');

      // Search comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .ilike('content', `%${term}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      setPosts((postsData || []).map(post => ({
        ...post,
        sentiment: post.sentiment as 'positive' | 'negative' | 'neutral'
      })));
      
      setCompanies((companiesData || []).map(company => ({
        ...company,
        company_type: company.company_type as 'product' | 'service' | undefined
      })));
      
      setComments(commentsData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Search Results</h1>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies, posts, comments..."
                className="pl-12 text-lg h-12"
              />
            </form>
            {query && (
              <p className="text-muted-foreground mt-3">
                Showing results for: <span className="font-semibold text-foreground">"{query}"</span>
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  All ({posts.length + companies.length + comments.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Companies ({companies.length})
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({comments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                {companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Companies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companies.slice(0, 4).map((company) => (
                        <CompanyCard
                          key={company.id}
                          company={company as any}
                          onClick={() => navigate(`/company/${company.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {posts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Posts</h3>
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {comments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Comments</h3>
                    <div className="space-y-3">
                      {comments.slice(0, 5).map((comment) => (
                        <Card key={comment.id} className="p-4 hover:border-brand transition-colors cursor-pointer">
                          <p className="text-sm text-foreground line-clamp-2">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {posts.length === 0 && companies.length === 0 && comments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="posts" className="space-y-4 mt-6">
                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No posts found</p>
                )}
              </TabsContent>

              <TabsContent value="companies" className="mt-6">
                {companies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map((company) => (
                      <CompanyCard
                        key={company.id}
                        company={company as any}
                        onClick={() => navigate(`/company/${company.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No companies found</p>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-3 mt-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Card key={comment.id} className="p-4 hover:border-brand transition-colors cursor-pointer">
                      <p className="text-sm text-foreground">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No comments found</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
