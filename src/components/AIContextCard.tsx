import { Card } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useState } from 'react';

interface AIContextCardProps {
  postId: string;
  aiContext?: string | null;
  aiAnalyzedAt?: string | null;
  onAnalysisComplete?: () => void;
}

export function AIContextCard({ postId, aiContext, aiAnalyzedAt, onAnalysisComplete }: AIContextCardProps) {
  const { analyzePost, analyzing } = useAIAnalysis();
  const [localContext, setLocalContext] = useState(aiContext);

  const handleAnalyze = async () => {
    const context = await analyzePost(postId);
    if (context) {
      setLocalContext(context);
      onAnalysisComplete?.();
    }
  };

  if (!localContext && !analyzing) {
    return (
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">Get AI Insights</span>
          </div>
          <Button onClick={handleAnalyze} size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze Post
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Get AI-powered context and insights about this post
        </p>
      </Card>
    );
  }

  if (analyzing) {
    return (
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <span className="font-medium">Analyzing post with AI...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="font-semibold">AI Insights</span>
        </div>
        <Button 
          onClick={handleAnalyze} 
          variant="ghost" 
          size="sm"
          className="gap-2 -mt-1"
        >
          <Sparkles className="h-4 w-4" />
          Re-analyze
        </Button>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-sm whitespace-pre-wrap text-foreground/90">{localContext}</p>
      </div>
      {aiAnalyzedAt && (
        <p className="text-xs text-muted-foreground mt-3">
          Analyzed {new Date(aiAnalyzedAt).toLocaleString()}
        </p>
      )}
    </Card>
  );
}