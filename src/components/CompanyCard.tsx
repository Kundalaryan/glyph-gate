import { MapPin, MessageCircle, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Company } from "@/data/sampleData";

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
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

  return (
    <Card 
      className="p-6 hover:bg-card-hover hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Company Logo Placeholder */}
          <div className="w-12 h-12 bg-gradient-to-br from-brand/20 to-brand/10 rounded-lg flex items-center justify-center">
            <span className="text-brand font-bold text-lg">
              {company.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
        </div>
        <Badge variant="outline" className={getTierColor(company.tier)}>
          {company.tier}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2" />
          {company.location}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MessageCircle className="w-4 h-4 mr-2" />
          {company.postCount} posts
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="w-4 h-4 mr-2 fill-current text-yellow-500" />
          {company.averageRating}/5.0 rating
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Click to view company discussions and reviews
        </p>
      </div>
    </Card>
  );
}