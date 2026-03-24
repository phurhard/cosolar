import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CountryChart({ installations, metric = 'kva' }) {
  const data = useMemo(() => {
    const countryData = {};
    
    installations.forEach(inst => {
      const country = inst.country || 'Other';
      if (!countryData[country]) {
        countryData[country] = { 
          country, 
          kva: 0, 
          panels: 0, 
          batteries: 0, 
          installations: 0 
        };
      }
      countryData[country].kva += inst.system_size_kva || 0;
      countryData[country].panels += inst.number_of_panels || 0;
      countryData[country].batteries += inst.number_of_batteries || 0;
      countryData[country].installations += 1;
    });

    return Object.values(countryData)
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 10);
  }, [installations, metric]);

  const colors = [
    'hsl(38, 92%, 50%)',
    'hsl(142, 76%, 36%)',
    'hsl(221, 83%, 53%)',
    'hsl(262, 83%, 58%)',
    'hsl(0, 84%, 60%)',
    'hsl(38, 92%, 60%)',
    'hsl(142, 76%, 46%)',
    'hsl(221, 83%, 63%)',
    'hsl(262, 83%, 68%)',
    'hsl(0, 84%, 70%)',
  ];

  const metricLabels = {
    kva: 'kVA Capacity',
    panels: 'Solar Panels',
    batteries: 'Batteries',
    installations: 'Installations'
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Top Countries by {metricLabels[metric]}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                dataKey="country" 
                type="category" 
                stroke="hsl(var(--muted-foreground))"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}