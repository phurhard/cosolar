import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InstallerProfile } from '@/api/supabaseClient';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Loader2, Leaf } from 'lucide-react';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import { COUNTRY_FILTER_OPTIONS } from '@/lib/constants';

export default function Leaderboard() {
  const [metric, setMetric] = useState('kva');
  const [country, setCountry] = useState('All Countries');

  const { data: installers = [], isLoading } = useQuery({
    queryKey: ['installers'],
    queryFn: () => InstallerProfile.list(),
  });

  const filteredInstallers = country === 'All Countries'
    ? installers
    : installers.filter(i => i.country === country);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Installer Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Recognizing Africa's top solar installation companies
            </p>
          </div>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-48 bg-card">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_FILTER_OPTIONS.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Metric Tabs */}
        <div className="mb-6">
          <Tabs value={metric} onValueChange={setMetric}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="kva">By kVA Capacity</TabsTrigger>
              <TabsTrigger value="panels">By Panels Installed</TabsTrigger>
              <TabsTrigger value="installations">By Project Count</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable installers={filteredInstallers} metric={metric} />

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {filteredInstallers.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Registered Installers
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-accent">
              {filteredInstallers.reduce((sum, i) => sum + (i.total_kva || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Combined kVA Capacity
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-chart-3">
              {filteredInstallers.reduce((sum, i) => sum + (i.total_installations || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Installations
            </div>
          </div>
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">
              {Math.round(filteredInstallers.reduce((sum, i) => sum + (i.total_carbon_offset_tons || i.total_kva || 0), 0)).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Tons CO₂ Offset/Year
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
