import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Lightbulb, Fan, Refrigerator, AirVent, Tv, WashingMachine,
  Monitor, Microwave, Zap, RotateCcw, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplianceRow from '@/components/calculator/ApplianceRow';
import ResultSection from '@/components/calculator/ResultSection';

const APPLIANCE_CATEGORIES = {
  Lighting: [
    { name: 'LED Bulb', power: 10, icon: Lightbulb, iconColor: 'bg-yellow-500/10 text-yellow-500' },
    { name: 'Energy Saving Bulb', power: 25, icon: Lightbulb, iconColor: 'bg-yellow-600/10 text-yellow-600' },
    { name: 'Fluorescent Tube', power: 40, icon: Lightbulb, iconColor: 'bg-yellow-400/10 text-yellow-400' },
    { name: 'Spotlight / Halogen', power: 50, icon: Lightbulb, iconColor: 'bg-amber-500/10 text-amber-500' },
  ],
  Cooling: [
    { name: 'Ceiling Fan', power: 75, icon: Fan, iconColor: 'bg-blue-500/10 text-blue-500' },
    { name: 'Standing Fan', power: 60, icon: Fan, iconColor: 'bg-blue-400/10 text-blue-400' },
    { name: 'Air Conditioner (1HP)', power: 1000, icon: AirVent, iconColor: 'bg-cyan-500/10 text-cyan-500' },
    { name: 'Air Conditioner (1.5HP)', power: 1500, icon: AirVent, iconColor: 'bg-cyan-600/10 text-cyan-600' },
    { name: 'Air Conditioner (2HP)', power: 2000, icon: AirVent, iconColor: 'bg-cyan-700/10 text-cyan-700' },
  ],
  Kitchen: [
    { name: 'Refrigerator', power: 150, icon: Refrigerator, iconColor: 'bg-emerald-500/10 text-emerald-500' },
    { name: 'Deep Freezer', power: 200, icon: Refrigerator, iconColor: 'bg-emerald-600/10 text-emerald-600' },
    { name: 'Microwave Oven', power: 1200, icon: Microwave, iconColor: 'bg-orange-500/10 text-orange-500' },
    { name: 'Electric Kettle', power: 1500, icon: Zap, iconColor: 'bg-red-500/10 text-red-500' },
    { name: 'Blender', power: 350, icon: Zap, iconColor: 'bg-green-500/10 text-green-500' },
  ],
  Entertainment: [
    { name: 'LED TV (32")', power: 50, icon: Tv, iconColor: 'bg-purple-500/10 text-purple-500' },
    { name: 'LED TV (55")', power: 100, icon: Tv, iconColor: 'bg-purple-600/10 text-purple-600' },
    { name: 'Decoder / Set-top Box', power: 30, icon: Tv, iconColor: 'bg-purple-400/10 text-purple-400' },
    { name: 'Sound System', power: 100, icon: Tv, iconColor: 'bg-violet-500/10 text-violet-500' },
    { name: 'Desktop Computer', power: 250, icon: Monitor, iconColor: 'bg-slate-500/10 text-slate-500' },
    { name: 'Laptop', power: 65, icon: Monitor, iconColor: 'bg-slate-400/10 text-slate-400' },
  ],
  Laundry: [
    { name: 'Washing Machine', power: 500, icon: WashingMachine, iconColor: 'bg-teal-500/10 text-teal-500' },
    { name: 'Iron', power: 1200, icon: Zap, iconColor: 'bg-rose-500/10 text-rose-500' },
  ],
  Other: [
    { name: 'Water Pump', power: 750, icon: Zap, iconColor: 'bg-sky-500/10 text-sky-500' },
    { name: 'Phone Charger', power: 20, icon: Zap, iconColor: 'bg-indigo-400/10 text-indigo-400' },
    { name: 'Security Camera System', power: 50, icon: Monitor, iconColor: 'bg-gray-500/10 text-gray-500' },
    { name: 'Router / Modem', power: 15, icon: Zap, iconColor: 'bg-indigo-500/10 text-indigo-500' },
  ],
};

export default function LoadCalculator() {
  const [appliances, setAppliances] = useState(() => {
    const initial = {};
    Object.entries(APPLIANCE_CATEGORIES).forEach(([, items]) => {
      items.forEach((appliance) => {
        initial[appliance.name] = { quantity: 0, hours: 4 };
      });
    });
    return initial;
  });

  const updateQuantity = (name, quantity) => {
    setAppliances((prev) => ({
      ...prev,
      [name]: { ...prev[name], quantity },
    }));
  };

  const updateHours = (name, hours) => {
    setAppliances((prev) => ({
      ...prev,
      [name]: { ...prev[name], hours },
    }));
  };

  const resetAll = () => {
    setAppliances((prev) => {
      const reset = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = { quantity: 0, hours: 4 };
      });
      return reset;
    });
  };

  const { totalLoadKwh, peakLoadWatts, activeCount } = useMemo(() => {
    let totalWh = 0;
    let peakW = 0;
    let count = 0;

    Object.entries(APPLIANCE_CATEGORIES).forEach(([, items]) => {
      items.forEach((appliance) => {
        const state = appliances[appliance.name];
        if (state && state.quantity > 0) {
          totalWh += appliance.power * state.quantity * state.hours;
          peakW += appliance.power * state.quantity;
          count += state.quantity;
        }
      });
    });

    return {
      totalLoadKwh: totalWh / 1000,
      peakLoadWatts: peakW,
      activeCount: count,
    };
  }, [appliances]);

  const categoryKeys = Object.keys(APPLIANCE_CATEGORIES);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Load Calculator
              </h1>
              <p className="text-muted-foreground">
                Calculate your daily energy needs and get solar system recommendations
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{activeCount}</div>
                  <div className="text-xs text-muted-foreground">Appliances</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{totalLoadKwh.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">kWh/day</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{(peakLoadWatts / 1000).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Peak kW</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appliance Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Your Appliances</CardTitle>
                  <CardDescription>Set quantity and daily usage hours for each appliance</CardDescription>
                </div>
                {activeCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetAll} className="text-muted-foreground">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categoryKeys[0]}>
                <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-secondary/50">
                  {categoryKeys.map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categoryKeys.map((cat) => (
                  <TabsContent key={cat} value={cat}>
                    <div className="space-y-3">
                      {APPLIANCE_CATEGORIES[cat].map((appliance) => (
                        <ApplianceRow
                          key={appliance.name}
                          name={appliance.name}
                          power={appliance.power}
                          icon={appliance.icon}
                          iconColor={appliance.iconColor}
                          quantity={appliances[appliance.name]?.quantity || 0}
                          hours={appliances[appliance.name]?.hours || 4}
                          onChange={(q) => updateQuantity(appliance.name, q)}
                          onHoursChange={(h) => updateHours(appliance.name, h)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <ResultSection totalLoadKwh={totalLoadKwh} peakLoadWatts={peakLoadWatts} />
      </div>
    </div>
  );
}
