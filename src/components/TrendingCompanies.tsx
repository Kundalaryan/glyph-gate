import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TrendingCompany {
  id: string;
  name: string;
  industry: string;
  post_count: number;
  recent_post_count: number;
}

interface TrendingCompaniesProps {
  period?: "week" | "month";
  limit?: number;
}

export function TrendingCompanies({ period = "week", limit = 5 }: TrendingCompaniesProps) {
  const [companies, setCompanies] = useState<TrendingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingCompanies();
  }, [period]);

  const fetchTrendingCompanies = async () => {
    try {
      setLoading(true);
      const daysAgo = period === "week" ? 7 : 30;
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

      // Get recent posts per company
      const { data: recentPosts, error } = await supabase
        .from('posts')
        .select('company_id, company_name, companies(id, name, industry)')
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Count posts per company
      const companyCounts = recentPosts?.reduce((acc, post) => {
        const companyId = post.company_id;
        if (!acc[companyId]) {
          acc[companyId] = {
            id: companyId,
            name: post.company_name,
            industry: (post.companies as any)?.industry || 'Unknown',
            post_count: 0,
            recent_post_count: 0,
          };
        }
        acc[companyId].recent_post_count++;
        return acc;
      }, {} as Record<string, TrendingCompany>);

      // Get total post counts
      const { data: allCompanies } = await supabase
        .from('companies')
        .select('id, name, industry, post_count');

      // Merge data
      const mergedData = Object.values(companyCounts || {}).map(company => {
        const fullData = allCompanies?.find(c => c.id === company.id);
        return {
          ...company,
          post_count: fullData?.post_count || 0,
        };
      });

      // Sort by recent activity
      const sorted = mergedData
        .sort((a, b) => b.recent_post_count - a.recent_post_count)
        .slice(0, limit);

      setCompanies(sorted);
    } catch (error) {
      console.error('Error fetching trending companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-brand" />
          Trending This {period === "week" ? "Week" : "Month"}
        </h3>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-brand" />
        Trending This {period === "week" ? "Week" : "Month"}
      </h3>
      <div className="space-y-4">
        {companies.map((company, index) => (
          <div
            key={company.id}
            className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
            onClick={() => navigate(`/company/${company.id}`)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand/10 text-brand font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {company.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {company.industry}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {company.recent_post_count} new posts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
