import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun, Battery, Zap, Layers, ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ResultSection({ totalLoadKwh, peakLoadWatts }) {
  if (totalLoadKwh <= 0) return null;

  // Solar sizing calculations
  const sunHours = 5; // Average peak sun hours in Nigeria/Africa
  const systemLosses = 0.80; // 80% efficiency (inverter + cable + temperature losses)
  const panelWattage = 450; // Standard panel wattage

  const requiredSolarKw = totalLoadKwh / (sunHours * systemLosses);
  const requiredSolarKva = requiredSolarKw / 0.8; // power factor
  const recommendedPanels = Math.ceil((requiredSolarKw * 1000) / panelWattage);

  // Battery sizing (1 day autonomy)
  const batteryDod = 0.80; // 80% Depth of Discharge for lithium
  const batteryEfficiency = 0.95;
  const requiredBatteryKwh = totalLoadKwh / (batteryDod * batteryEfficiency);
  const batteryCapacityEach = 5; // kWh per battery (e.g., Pylontech US5000)
  const recommendedBatteries = Math.ceil(requiredBatteryKwh / batteryCapacityEach);

  // Inverter sizing
  const inverterSafetyMargin = 1.25;
  const requiredInverterKva = (peakLoadWatts / 1000) * inverterSafetyMargin / 0.8;
  const inverterSizeKva = Math.ceil(requiredInverterKva);

  // Carbon impact
  const annualCarbonOffset = (requiredSolarKva * 1.0); // tons CO2/year
  const lifetimeCarbonOffset = annualCarbonOffset * 25;

  const results = [
    {
      icon: Layers,
      label: 'Solar Panels',
      value: recommendedPanels,
      unit: `× ${panelWattage}W panels`,
      detail: `${requiredSolarKw.toFixed(1)} kW total`,
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Battery,
      label: 'Battery Storage',
      value: recommendedBatteries,
      unit: `× ${batteryCapacityEach} kWh batteries`,
      detail: `${requiredBatteryKwh.toFixed(1)} kWh needed`,
      color: 'bg-chart-3/10 text-chart-3',
    },
    {
      icon: Zap,
      label: 'Inverter Size',
      value: inverterSizeKva,
      unit: 'kVA capacity',
      detail: `Peak load: ${(peakLoadWatts / 1000).toFixed(1)} kW`,
      color: 'bg-chart-4/10 text-chart-4',
    },
    {
      icon: Leaf,
      label: 'CO₂ Offset',
      value: annualCarbonOffset.toFixed(1),
      unit: 'tons/year',
      detail: `${lifetimeCarbonOffset.toFixed(0)} tons lifetime`,
      color: 'bg-accent/10 text-accent',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-primary/30 shadow-lg shadow-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sun className="w-6 h-6 text-primary" />
              Recommended System
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {totalLoadKwh.toFixed(1)} kWh/day load
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-secondary/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                    <p className="text-xs text-primary mt-1">{item.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mt-4">
            <p className="text-sm text-muted-foreground mb-1">
              <strong className="text-foreground">Note:</strong> These calculations assume {sunHours} peak sun hours/day,
              {panelWattage}W panels, {batteryCapacityEach}kWh LiFePO4 batteries, and 1-day battery autonomy.
              Actual sizing may vary based on location, shading, and usage patterns.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Link to={createPageUrl('CostBenefit')}>
              <Button className="bg-primary hover:bg-primary/90">
                Calculate Cost & Savings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
