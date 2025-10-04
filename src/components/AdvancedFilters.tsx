import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export interface FilterState {
  sentiment: string[];
  dateRange: { from?: Date; to?: Date };
  locations: string[];
  industries: string[];
  companySizes: string[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableLocations?: string[];
  availableIndustries?: string[];
}

export function AdvancedFilters({
  filters,
  onFilterChange,
  availableLocations = [],
  availableIndustries = [],
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sentiments = ["positive", "negative", "neutral"];
  const companySizes = ["Startup", "Small", "Medium", "Large", "Enterprise"];

  const toggleSentiment = (sentiment: string) => {
    const newSentiments = filters.sentiment.includes(sentiment)
      ? filters.sentiment.filter(s => s !== sentiment)
      : [...filters.sentiment, sentiment];
    onFilterChange({ ...filters, sentiment: newSentiments });
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    onFilterChange({ ...filters, locations: newLocations });
  };

  const toggleIndustry = (industry: string) => {
    const newIndustries = filters.industries.includes(industry)
      ? filters.industries.filter(i => i !== industry)
      : [...filters.industries, industry];
    onFilterChange({ ...filters, industries: newIndustries });
  };

  const toggleCompanySize = (size: string) => {
    const newSizes = filters.companySizes.includes(size)
      ? filters.companySizes.filter(s => s !== size)
      : [...filters.companySizes, size];
    onFilterChange({ ...filters, companySizes: newSizes });
  };

  const clearAllFilters = () => {
    onFilterChange({
      sentiment: [],
      dateRange: {},
      locations: [],
      industries: [],
      companySizes: [],
    });
  };

  const hasActiveFilters =
    filters.sentiment.length > 0 ||
    filters.locations.length > 0 ||
    filters.industries.length > 0 ||
    filters.companySizes.length > 0 ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full text-xs text-brand-foreground flex items-center justify-center">
                {filters.sentiment.length +
                  filters.locations.length +
                  filters.industries.length +
                  filters.companySizes.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-[600px] overflow-y-auto bg-card" align="start">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sentiment</label>
              <div className="flex flex-wrap gap-2">
                {sentiments.map((sentiment) => (
                  <Badge
                    key={sentiment}
                    variant={filters.sentiment.includes(sentiment) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleSentiment(sentiment)}
                  >
                    {sentiment}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, yyyy")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="range"
                    selected={
                      filters.dateRange.from && filters.dateRange.to
                        ? { from: filters.dateRange.from, to: filters.dateRange.to }
                        : undefined
                    }
                    onSelect={(range) =>
                      onFilterChange({ ...filters, dateRange: range || {} })
                    }
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location Filter */}
            {availableLocations.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableLocations.map((location) => (
                    <Badge
                      key={location}
                      variant={filters.locations.includes(location) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLocation(location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Filter */}
            {availableIndustries.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableIndustries.map((industry) => (
                    <Badge
                      key={industry}
                      variant={filters.industries.includes(industry) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleIndustry(industry)}
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Company Size Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Company Size</label>
              <div className="flex flex-wrap gap-2">
                {companySizes.map((size) => (
                  <Badge
                    key={size}
                    variant={filters.companySizes.includes(size) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCompanySize(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
