import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TagCount {
  tag: string;
  count: number;
}

interface TagCloudProps {
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
  limit?: number;
}

export function TagCloud({ onTagClick, selectedTag, limit = 20 }: TagCloudProps) {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTagCounts();
  }, []);

  const fetchTagCounts = async () => {
    try {
      setLoading(true);
      const { data: posts, error } = await supabase
        .from('posts')
        .select('tags');

      if (error) throw error;

      // Count tag occurrences
      const tagCounts: Record<string, number> = {};
      posts?.forEach(post => {
        post.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // Convert to array and sort
      const sortedTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      setTags(sortedTags);
    } catch (error) {
      console.error('Error fetching tag counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-lg";
    if (ratio > 0.4) return "text-base";
    return "text-sm";
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-brand" />
          Tag Cloud
        </h3>
        <p className="text-sm text-muted-foreground">Loading tags...</p>
      </Card>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Hash className="w-5 h-5 mr-2 text-brand" />
        Tag Cloud
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            className={`cursor-pointer hover:bg-brand hover:text-brand-foreground transition-all ${getTagSize(count, maxCount)}`}
            onClick={() => onTagClick?.(tag)}
          >
            #{tag}
            <span className="ml-1.5 text-xs opacity-70">({count})</span>
          </Badge>
        ))}
      </div>
    </Card>
  );
}
