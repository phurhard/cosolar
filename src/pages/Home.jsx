import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Installation, InstallerProfile } from '@/api/supabaseClient';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import StorySection from '../components/home/StorySection';
import ImpactStories from '../components/home/ImpactStories';
import MissionSection from '../components/home/MissionSection';
import FeaturesSection from '../components/home/FeaturesSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  const { data: installations = [] } = useQuery({
    queryKey: ['installations-approved'],
    queryFn: () => Installation.filter({ status: 'approved' }),
  });

  const { data: installers = [] } = useQuery({
    queryKey: ['installers'],
    queryFn: () => InstallerProfile.list(),
  });

  // Calculate live stats
  const stats = {
    totalPanels: installations.reduce((sum, i) => sum + (i.number_of_panels || 0), 0),
    totalKva: Math.round(installations.reduce((sum, i) => sum + (i.system_size_kva || 0), 0)),
    totalBatteries: installations.reduce((sum, i) => sum + (i.number_of_batteries || 0), 0),
    totalBatteryKwh: installations.reduce((sum, i) => sum + (i.battery_capacity_kwh || 0), 0),
    totalInstallations: installations.length,
    totalInstallers: installers.length,
    totalCarbonOffset: installations.reduce((sum, i) => sum + (i.carbon_offset_tons_annual || i.system_size_kva || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection stats={stats} />
      <StorySection />
      <StatsSection stats={stats} />
      <ImpactStories />
      <MissionSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}