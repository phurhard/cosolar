import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Installation } from '@/api/supabaseClient';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsOverview from '../components/dashboard/StatsOverview';
import AfricaMap from '../components/dashboard/AfricaMap';
import CountryChart from '../components/dashboard/CountryChart';
import GrowthChart from '../components/dashboard/GrowthChart';
import InstallationTypeChart from '../components/dashboard/InstallationTypeChart';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import CarbonChart from '../components/carbon/CarbonChart';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    country: 'All Countries',
    year: 'All Years',
    type: 'All Types',
  });
  const [metric, setMetric] = useState('kva');

  const { data: installations = [], isLoading } = useQuery({
    queryKey: ['installations-approved'],
    queryFn: () => Installation.filter({ status: 'approved' }),
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      country: 'All Countries',
      year: 'All Years',
      type: 'All Types',
    });
  };

  const filteredInstallations = useMemo(() => {
    return installations.filter(inst => {
      if (filters.country !== 'All Countries' && inst.country !== filters.country) return false;
      if (filters.type !== 'All Types' && inst.installation_type !== filters.type) return false;
      if (filters.year !== 'All Years') {
        const year = new Date(inst.installation_date).getFullYear().toString();
        if (year !== filters.year) return false;
      }
      return true;
    });
  }, [installations, filters]);

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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Solar Analytics
          </h1>
          <p className="text-muted-foreground">
            Real-time insights into Africa's solar installation landscape
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <DashboardFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview installations={filteredInstallations} />
        </div>

        {/* Map */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Geographic Distribution</h2>
          <AfricaMap installations={filteredInstallations} />
        </div>

        {/* Metric Toggle */}
        <div className="mb-6">
          <Tabs value={metric} onValueChange={setMetric}>
            <TabsList>
              <TabsTrigger value="kva">kVA Capacity</TabsTrigger>
              <TabsTrigger value="panels">Solar Panels</TabsTrigger>
              <TabsTrigger value="batteries">Batteries</TabsTrigger>
              <TabsTrigger value="installations">Installations</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CountryChart installations={filteredInstallations} metric={metric} />
          <GrowthChart installations={filteredInstallations} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InstallationTypeChart installations={filteredInstallations} />
          <CarbonChart installations={filteredInstallations} />
        </div>
      </div>
    </div>
  );
}
