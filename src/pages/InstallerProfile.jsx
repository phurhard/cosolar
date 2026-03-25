import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InstallerProfile as InstallerProfileAPI, Installation } from '@/api/supabaseClient';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CarbonImpactCard from '../components/carbon/CarbonImpactCard';
import {
  MapPin, Clock, Award, Globe, Phone,
  Zap, Sun, Battery, FileText, CheckCircle, Trophy,
  Loader2, ArrowLeft, ExternalLink, Leaf
} from 'lucide-react';

export default function InstallerProfile() {
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('id');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['installer-profile', profileId],
    queryFn: async () => {
      const profiles = await InstallerProfileAPI.filter({ id: profileId });
      return profiles[0];
    },
    enabled: !!profileId,
  });

  const { data: installations = [] } = useQuery({
    queryKey: ['installer-installations', profileId],
    queryFn: () => Installation.filter({ installer_profile_id: profileId, status: 'approved' }),
    enabled: !!profileId,
  });

  const { data: allInstallers = [] } = useQuery({
    queryKey: ['all-installers-ranking'],
    queryFn: () => InstallerProfileAPI.list(),
  });

  const getRank = () => {
    const sorted = allInstallers
      .filter(installer => !installer.is_system_profile)
      .sort((a, b) => (b.total_kva || 0) - (a.total_kva || 0));
    return sorted.findIndex(i => i.id === profileId) + 1;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">This installer profile doesn't exist.</p>
          <Link to={createPageUrl('Leaderboard')}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (profile.is_system_profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">This installer profile is not publicly available.</p>
          <Link to={createPageUrl('Leaderboard')}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const rank = getRank();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-card to-secondary/30 border-b border-border">
        <div className="container mx-auto px-6 py-12">
          <Link to={createPageUrl('Leaderboard')} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold">
              {profile.company_name?.charAt(0) || '?'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {profile.company_name}
                </h1>
                {profile.verified && (
                  <CheckCircle className="w-6 h-6 text-accent" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city && `${profile.city}, `}{profile.state && `${profile.state}, `}{profile.country}
                </span>
                {profile.years_of_experience > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {profile.years_of_experience} years experience
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {rank <= 10 && (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Top 10 Africa
                  </Badge>
                )}
                {rank <= 3 && profile.country === 'Nigeria' && (
                  <Badge className="bg-accent/10 text-accent border-accent/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Top 3 Nigeria
                  </Badge>
                )}
                {profile.certifications?.map((cert, i) => (
                  <Badge key={i} variant="secondary">
                    <Award className="w-3 h-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="bg-card/50 border-primary/30">
              <CardContent className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">Africa Rank</div>
                <div className="text-4xl font-bold text-primary">#{rank}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Installation Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {(profile.total_kva || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total kVA</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <Sun className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {(profile.total_panels || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Panels</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <Battery className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {(profile.total_batteries || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Batteries</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-6 h-6 text-chart-3 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {(profile.total_installations || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <Leaf className="w-6 h-6 text-accent mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(profile.total_carbon_offset_tons || profile.total_kva || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">CO₂ Offset (tons/yr)</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Environmental Impact</h2>
              <CarbonImpactCard
                carbonTonsAnnual={profile.total_carbon_offset_tons || profile.total_kva || 0}
                carbonTonsLifetime={profile.total_carbon_offset_lifetime || (profile.total_kva * 25) || 0}
                creditValue={profile.carbon_credit_value_usd || (profile.total_carbon_offset_lifetime || profile.total_kva * 25) * 15 || 0}
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Installations</h2>
              {installations.length > 0 ? (
                <div className="space-y-4">
                  {installations.slice(0, 5).map(inst => (
                    <Card key={inst.id} className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-foreground">
                              {inst.installation_type} • {inst.city}, {inst.state}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {inst.system_size_kva} kVA • {inst.number_of_panels} panels
                            </div>
                          </div>
                          <Badge variant="secondary">{inst.country}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No approved installations yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">{profile.phone}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {profile.bio && (
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
