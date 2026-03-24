import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { InstallerProfile } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, Award, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/lib/constants';

export default function InstallerSignup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company_name: '',
    country: '',
    state: '',
    city: '',
    years_of_experience: '',
    phone: '',
    website: '',
    bio: '',
    certifications: [],
  });
  const [certInput, setCertInput] = useState('');

  const { data: existingProfile } = useQuery({
    queryKey: ['my-profile', user?.email],
    queryFn: () => InstallerProfile.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (existingProfile && existingProfile.length > 0) {
      navigate(createPageUrl('InstallerProfile') + `?id=${existingProfile[0].id}`);
    }
  }, [existingProfile, navigate]);

  const createProfileMutation = useMutation({
    mutationFn: (data) => InstallerProfile.create({ ...data, created_by: user?.email }),
    onSuccess: (result) => {
      toast.success('Profile created successfully!');
      navigate(createPageUrl('InstallerProfile') + `?id=${result.id}`);
    },
    onError: () => {
      toast.error('Failed to create profile');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.country) {
      toast.error('Please fill in required fields');
      return;
    }
    createProfileMutation.mutate({
      ...formData,
      years_of_experience: parseInt(formData.years_of_experience) || 0,
    });
  };

  const addCertification = () => {
    if (certInput.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certInput.trim()]
      }));
      setCertInput('');
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Installer Profile</CardTitle>
            <CardDescription>
              Join Africa's solar registry and showcase your installations
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your solar company name"
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input
                    id="years_of_experience"
                    type="number"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                    placeholder="0"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+234..."
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Your Company</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of your company and services..."
                  className="bg-background min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Add a certification"
                    className="bg-background"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" variant="outline" onClick={addCertification}>
                    Add
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        <Award className="w-3 h-3" />
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={createProfileMutation.isPending}
              >
                {createProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
