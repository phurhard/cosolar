import React from 'react';
import { Card } from '@/components/ui/card';
import { Sun, Zap, Battery, Building2, TrendingUp, Globe, Leaf } from 'lucide-react';

export default function StatsOverview({ installations }) {
  const stats = [
    {
      label: 'Total Installations',
      value: installations.length,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total kVA',
      value: installations.reduce((sum, i) => sum + (i.system_size_kva || 0), 0).toLocaleString(),
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Solar Panels',
      value: installations.reduce((sum, i) => sum + (i.number_of_panels || 0), 0).toLocaleString(),
      icon: Sun,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Batteries',
      value: installations.reduce((sum, i) => sum + (i.number_of_batteries || 0), 0).toLocaleString(),
      icon: Battery,
      color: 'text-chart-3',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Countries',
      value: new Set(installations.map(i => i.country)).size,
      icon: Globe,
      color: 'text-chart-4',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'This Month',
      value: installations.filter(i => {
        const date = new Date(i.installation_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'CO₂ Offset/Year',
      value: Math.round(installations.reduce((sum, i) => sum + (i.carbon_offset_tons_annual || i.system_size_kva || 0), 0)).toLocaleString() + ' tons',
      icon: Leaf,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 bg-card border-border hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}