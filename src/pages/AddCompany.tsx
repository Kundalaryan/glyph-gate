import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCompany } from '@/hooks/useCreateCompany';
import { useAuth } from '@/hooks/useAuth';
import { Building2 } from 'lucide-react';

export default function AddCompany() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCompany, loading } = useCreateCompany();
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    tier: '',
    address: '',
    company_type: '' as 'product' | 'service' | '',
    timings: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.industry || !formData.location || !formData.tier) {
      return;
    }

    const success = await createCompany({
      name: formData.name,
      industry: formData.industry,
      location: formData.location,
      tier: formData.tier,
      address: formData.address || undefined,
      company_type: formData.company_type || undefined,
      timings: formData.timings || undefined
    });

    if (success) {
      navigate('/companies');
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
              <CardDescription>Please sign in to add a company</CardDescription>
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
              <Building2 className="w-6 h-6 text-brand" />
              <CardTitle>Add New Company</CardTitle>
            </div>
            <CardDescription>Share information about a company</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Company Size *</Label>
                  <Select value={formData.tier} onValueChange={(value) => setFormData({ ...formData, tier: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Mid-size">Mid-size</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_type">Company Type</Label>
                  <Select value={formData.company_type} onValueChange={(value: 'product' | 'service') => setFormData({ ...formData, company_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Based</SelectItem>
                      <SelectItem value="service">Service Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timings">Working Hours</Label>
                <Input
                  id="timings"
                  value={formData.timings}
                  onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                  placeholder="e.g., Mon-Fri 9AM-6PM"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={loading} className="bg-brand hover:bg-brand-hover text-brand-foreground">
                  {loading ? 'Adding...' : 'Add Company'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/companies')}>
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
