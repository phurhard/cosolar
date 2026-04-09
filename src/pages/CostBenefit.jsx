import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, TrendingUp, Zap, Leaf, Calendar, ArrowRight,
  Sun, Battery, PiggyBank, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

const TARIFF_BANDS = {
  'Band A (20+ hrs)': 225,
  'Band B (16-20 hrs)': 63.36,
  'Band C (12-16 hrs)': 50.76,
  'Band D (8-12 hrs)': 43.8,
  'Band E (4-8 hrs)': 36.49,
};

const DIESEL_COST_PER_LITRE = 1200; // NGN
const DIESEL_CONSUMPTION = 0.3; // litres per kWh

export default function CostBenefit() {
  const [inputs, setInputs] = useState({
    monthlyConsumption: '300', // kWh
    tariffBand: 'Band A (20+ hrs)',
    systemSizeKva: '5',
    systemCost: '5000000', // NGN
    dieselUsage: 'no',
    dieselHoursPerDay: '4',
    generatorSize: '3.5', // kVA
  });

  const updateInput = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const analysis = useMemo(() => {
    const monthlyKwh = parseFloat(inputs.monthlyConsumption) || 0;
    const systemCost = parseFloat(inputs.systemCost) || 0;
    const systemKva = parseFloat(inputs.systemSizeKva) || 0;
    const tariffRate = TARIFF_BANDS[inputs.tariffBand] || 225;

    // Grid cost calculations
    const monthlyGridCost = monthlyKwh * tariffRate;
    const annualGridCost = monthlyGridCost * 12;

    // Diesel/Generator costs
    let monthlyDieselCost = 0;
    if (inputs.dieselUsage === 'yes') {
      const dailyDieselHours = parseFloat(inputs.dieselHoursPerDay) || 0;
      const genKva = parseFloat(inputs.generatorSize) || 0;
      const dailyKwh = genKva * 0.8 * dailyDieselHours;
      const dailyLitres = dailyKwh * DIESEL_CONSUMPTION;
      monthlyDieselCost = dailyLitres * DIESEL_COST_PER_LITRE * 30;
    }

    const monthlyTotalEnergyCost = monthlyGridCost + monthlyDieselCost;
    const annualTotalEnergyCost = monthlyTotalEnergyCost * 12;

    // Solar savings
    const solarMaintenanceAnnual = systemCost * 0.01; // 1% of capital per year
    const annualSolarSavings = annualTotalEnergyCost - solarMaintenanceAnnual;
    const monthlySolarSavings = annualSolarSavings / 12;

    // Payback
    const paybackYears = annualSolarSavings > 0 ? systemCost / annualSolarSavings : 0;

    // ROI over 25 years
    const lifetimeSavings = (annualSolarSavings * 25) - systemCost;
    const roi = systemCost > 0 ? (lifetimeSavings / systemCost) * 100 : 0;

    // Carbon impact
    const annualCarbonOffset = systemKva * 1.0;
    const lifetimeCarbonOffset = annualCarbonOffset * 25;
    const carbonCreditValue = lifetimeCarbonOffset * 15; // $15/ton

    // Year-by-year projection
    const yearProjection = [];
    let cumulativeSavings = -systemCost;
    let cumulativeGrid = 0;
    const annualInflation = 0.08; // 8% annual tariff increase
    let currentAnnualCost = annualTotalEnergyCost;

    for (let year = 1; year <= 25; year++) {
      currentAnnualCost *= (1 + annualInflation);
      cumulativeSavings += currentAnnualCost - solarMaintenanceAnnual;
      cumulativeGrid += currentAnnualCost;

      yearProjection.push({
        year: `Yr ${year}`,
        savings: Math.round(cumulativeSavings),
        gridCost: Math.round(cumulativeGrid),
        breakeven: cumulativeSavings >= 0,
      });
    }

    // Monthly comparison
    const monthlyComparison = [
      { name: 'Grid Bill', value: Math.round(monthlyGridCost), fill: 'hsl(var(--destructive))' },
      { name: 'Generator', value: Math.round(monthlyDieselCost), fill: 'hsl(var(--chart-5))' },
      { name: 'Solar Maintenance', value: Math.round(solarMaintenanceAnnual / 12), fill: 'hsl(var(--primary))' },
    ];

    return {
      monthlyGridCost,
      monthlyDieselCost,
      monthlyTotalEnergyCost,
      annualTotalEnergyCost,
      monthlySolarSavings,
      paybackYears,
      roi,
      lifetimeSavings,
      annualCarbonOffset,
      lifetimeCarbonOffset,
      carbonCreditValue,
      yearProjection,
      monthlyComparison,
    };
  }, [inputs]);

  const formatNaira = (value) => `₦${Math.abs(value).toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Cost-Benefit Analysis
              </h1>
              <p className="text-muted-foreground">
                Compare solar vs. grid electricity costs and calculate your ROI
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Your Energy Profile</CardTitle>
                <CardDescription>Enter your current energy usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Monthly Consumption (kWh)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={inputs.monthlyConsumption}
                    onChange={(e) => updateInput('monthlyConsumption', e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>NERC Tariff Band</Label>
                  <Select value={inputs.tariffBand} onValueChange={(v) => updateInput('tariffBand', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(TARIFF_BANDS).map((band) => (
                        <SelectItem key={band} value={band}>
                          {band} — ₦{TARIFF_BANDS[band]}/kWh
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <Label>Do you use a generator?</Label>
                  <Select value={inputs.dieselUsage} onValueChange={(v) => updateInput('dieselUsage', v)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inputs.dieselUsage === 'yes' && (
                  <>
                    <div className="space-y-2">
                      <Label>Generator Size (kVA)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={inputs.generatorSize}
                        onChange={(e) => updateInput('generatorSize', e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Generator Hours/Day</Label>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        value={inputs.dieselHoursPerDay}
                        onChange={(e) => updateInput('dieselHoursPerDay', e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </>
                )}

                <div className="border-t border-border pt-4 space-y-2">
                  <Label>Solar System Size (kVA)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={inputs.systemSizeKva}
                    onChange={(e) => updateInput('systemSizeKva', e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated System Cost (₦)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100000"
                    value={inputs.systemCost}
                    onChange={(e) => updateInput('systemCost', e.target.value)}
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: DollarSign,
                  label: 'Monthly Savings',
                  value: formatNaira(analysis.monthlySolarSavings),
                  color: 'bg-primary/10 text-primary',
                },
                {
                  icon: Calendar,
                  label: 'Payback Period',
                  value: `${analysis.paybackYears.toFixed(1)} years`,
                  color: 'bg-chart-3/10 text-chart-3',
                },
                {
                  icon: TrendingUp,
                  label: 'ROI (25yr)',
                  value: `${analysis.roi.toFixed(0)}%`,
                  color: 'bg-chart-4/10 text-chart-4',
                },
                {
                  icon: Leaf,
                  label: 'CO₂ Offset/yr',
                  value: `${analysis.annualCarbonOffset.toFixed(1)} tons`,
                  color: 'bg-accent/10 text-accent',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <Card className="border-border hover:border-primary/30 transition-all">
                    <CardContent className="p-4">
                      <div className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="text-xl font-bold text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Monthly Cost Comparison */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Monthly Cost Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Monthly Energy Cost</p>
                      <p className="text-2xl font-bold text-destructive">
                        {formatNaira(analysis.monthlyTotalEnergyCost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Grid: {formatNaira(analysis.monthlyGridCost)}</p>
                      {analysis.monthlyDieselCost > 0 && (
                        <p className="text-xs text-muted-foreground">Diesel: {formatNaira(analysis.monthlyDieselCost)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-primary rotate-90" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div>
                      <p className="text-sm text-muted-foreground">With Solar — Monthly Savings</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatNaira(analysis.monthlySolarSavings)}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {analysis.annualTotalEnergyCost > 0
                        ? `${((analysis.monthlySolarSavings / analysis.monthlyTotalEnergyCost) * 100).toFixed(0)}% savings`
                        : '0%'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 25-Year Projection Chart */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  25-Year Cumulative Savings
                </CardTitle>
                <CardDescription>
                  Assumes 8% annual tariff increase. Break-even at{' '}
                  <span className="text-primary font-medium">{analysis.paybackYears.toFixed(1)} years</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.yearProjection}>
                      <defs>
                        <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="year"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [formatNaira(value), '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#savingsGradient)"
                        name="Net Savings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">Environmental Impact</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {analysis.annualCarbonOffset.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">tons CO₂/year</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {analysis.lifetimeCarbonOffset.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">tons lifetime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${analysis.carbonCreditValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">carbon credit value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
