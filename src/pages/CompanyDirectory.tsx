import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { CompanyCard } from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { useNavigate } from "react-router-dom";

const industries = ["All", "Technology", "Data Analytics", "Software Development", "Cloud Services", "Robotics", "Financial Services"];
const tiers = ["All", "Fortune 100", "Fortune 500", "Enterprise", "Startup", "Mid-size"];

export default function CompanyDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const navigate = useNavigate();
  const { companies, loading } = useCompanies();

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "All" || company.industry === selectedIndustry;
    const matchesTier = selectedTier === "All" || company.tier === selectedTier;
    
    return matchesSearch && matchesIndustry && matchesTier;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Company Directory</h1>
              <p className="text-muted-foreground">
                Discover companies and read anonymous employee reviews
              </p>
            </div>
            <Button className="bg-brand hover:bg-brand-hover text-brand-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search companies by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filters:</span>
            </div>
          </div>

          {/* Industry Filter */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant={selectedIndustry === industry ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedIndustry === industry 
                      ? 'bg-brand text-brand-foreground hover:bg-brand-hover' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tier Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-2">Company Size</h3>
            <div className="flex flex-wrap gap-2">
              {tiers.map((tier) => (
                <Badge
                  key={tier}
                  variant={selectedTier === tier ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedTier === tier 
                      ? 'bg-brand text-brand-foreground hover:bg-brand-hover' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCompanies.length} companies
          </p>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={{
                  ...company,
                  postCount: company.post_count,
                  averageRating: company.average_rating
                }}
                onClick={() => navigate(`/company/${company.id}`)}
              />
            ))}
          </div>
        )}

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No companies found matching your criteria.</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add a Company
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}