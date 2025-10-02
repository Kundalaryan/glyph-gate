import { Heart, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand" />
              Your Voice, Your Rights
            </h3>
            <p className="text-sm text-muted-foreground">
              Empowering employees to speak truth without fear. Every voice matters, 
              every story counts. Share your workplace experiences anonymously and help 
              others make informed career decisions.
            </p>
          </div>
          
          <div className="text-left md:text-right space-y-2">
            <p className="text-sm text-muted-foreground flex items-center justify-start md:justify-end gap-2">
              Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> and privacy in India
            </p>
            <p className="text-xs text-muted-foreground">
              100% Anonymous • Secure • Community-Driven
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} CompanyVoice. All voices protected. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
