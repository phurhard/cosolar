import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function CarbonChart({ installations }) {
  const data = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(now, 11);
    const months = eachMonthOfInterval({ start: startDate, end: now });

    let cumulativeCarbon = 0;

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthInstallations = installations.filter(inst => {
        if (!inst.installation_date) return false;
        const date = parseISO(inst.installation_date);
        return date >= monthStart && date < monthEnd;
      });

      const monthCarbon = monthInstallations.reduce((sum, i) => 
        sum + (i.carbon_offset_tons_annual || i.system_size_kva || 0), 0
      );
      
      cumulativeCarbon += monthCarbon;

      return {
        month: format(month, 'MMM yyyy'),
        monthly: Math.round(monthCarbon),
        cumulative: Math.round(cumulativeCarbon),
      };
    });
  }, [installations]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <span className="text-accent">●</span>
          Carbon Offset Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 20 }}>
              <defs>
                <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                label={{ value: 'Tons CO₂/year', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value, name) => [
                  `${value} tons CO₂/yr`,
                  name === 'monthly' ? 'Monthly Offset' : 'Cumulative Offset'
                ]}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorCarbon)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}