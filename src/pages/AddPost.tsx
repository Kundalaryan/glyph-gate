import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecurePosts } from '@/hooks/useSecurePosts';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AddPost() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { createPost, loading } = useSecurePosts();
  const { companies } = useCompanies();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    companyId: searchParams.get('companyId') || '',
    tags: [] as string[],
    isAnonymous: false
  });
  const [currentTag, setCurrentTag] = useState('');

  const selectedCompany = companies.find(c => c.id === formData.companyId);

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.companyId || !selectedCompany) {
      return;
    }

    const success = await createPost({
      title: formData.title,
      content: formData.content,
      companyId: formData.companyId,
      companyName: selectedCompany.name,
      tags: formData.tags,
      isAnonymous: formData.isAnonymous
    });

    if (success) {
      navigate('/');
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to create a post</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-brand" />
              <CardTitle>Create New Post</CardTitle>
            </div>
            <CardDescription>Share your experience about a company</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.filter(c => !c.is_hidden).map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} - {company.industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your experience"
                  required
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Your Experience *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your detailed experience with this company..."
                  required
                  rows={6}
                  maxLength={2000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag (e.g., Culture, Salary)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        #{tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Switch
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Post anonymously
                </Label>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-hover text-brand-foreground">
                  {loading ? 'Creating...' : 'Create Post'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
