import React from 'react';
import { Sun, Zap, Battery, Building2, Leaf } from 'lucide-react';
import LiveCounter from './LiveCounter';

export default function StatsSection({ stats }) {
  const totalPanelCapacityKw = Math.round((stats.totalPanels * 450) / 1000); // Assuming 450W panels
  const totalBatteryStorageKwh = Math.round(stats.totalBatteryKwh || 0);

  const counters = [
    { 
      value: stats.totalPanels, 
      label: 'Solar Panels Installed', 
      sublabel: 'Pieces',
      icon: Sun,
      delay: 0 
    },
    { 
      value: totalPanelCapacityKw, 
      label: 'Solar Panel Capacity', 
      sublabel: 'kW Total',
      icon: Zap,
      delay: 50 
    },
    { 
      value: stats.totalKva, 
      label: 'Total System Capacity', 
      sublabel: 'kVA',
      icon: Zap,
      delay: 100 
    },
    { 
      value: totalBatteryStorageKwh, 
      label: 'Battery Storage Deployed', 
      sublabel: 'kWh Total',
      icon: Battery,
      delay: 150 
    },
    { 
      value: stats.totalInstallations, 
      label: 'Installations Recorded', 
      sublabel: `${stats.totalInstallers} Installers`,
      icon: Building2,
      delay: 200 
    },
    { 
      value: Math.round(stats.totalCarbonOffset), 
      label: 'CO₂ Offset Per Year', 
      sublabel: 'Metric Tons',
      icon: Leaf,
      delay: 250,
      isGreen: true 
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live Impact Metrics
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-time statistics from verified solar installations across Africa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {counters.map((counter, index) => (
            <LiveCounter
              key={index}
              value={counter.value}
              label={counter.label}
              sublabel={counter.sublabel}
              icon={counter.icon}
              delay={counter.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
