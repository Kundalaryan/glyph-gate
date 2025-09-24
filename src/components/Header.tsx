import { Search, Plus, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-brand-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">CompanyVoice</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search companies, posts..." 
              className="pl-10 bg-background/50"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-brand ${
              isActive('/') ? 'text-brand' : 'text-muted-foreground'
            }`}
          >
            Feed
          </Link>
          <Link 
            to="/companies" 
            className={`text-sm font-medium transition-colors hover:text-brand ${
              isActive('/companies') ? 'text-brand' : 'text-muted-foreground'
            }`}
          >
            Companies
          </Link>
          <Button size="sm" className="bg-brand hover:bg-brand-hover text-brand-foreground">
            <Plus className="w-4 h-4 mr-1" />
            New Post
          </Button>
        </nav>
      </div>
    </header>
  );
}