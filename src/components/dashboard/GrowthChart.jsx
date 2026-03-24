import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export default function GrowthChart({ installations }) {
  const data = useMemo(() => {
    const now = new Date();
    const startDate = subMonths(now, 11);
    const months = eachMonthOfInterval({ start: startDate, end: now });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthInstallations = installations.filter(inst => {
        if (!inst.installation_date) return false;
        const date = parseISO(inst.installation_date);
        return date >= monthStart && date < monthEnd;
      });

      return {
        month: format(month, 'MMM yyyy'),
        installations: monthInstallations.length,
        kva: monthInstallations.reduce((sum, i) => sum + (i.system_size_kva || 0), 0),
        panels: monthInstallations.reduce((sum, i) => sum + (i.number_of_panels || 0), 0),
      };
    });
  }, [installations]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Monthly Growth Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 20 }}>
              <defs>
                <linearGradient id="colorKva" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInstallations" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="kva"
                stroke="hsl(38, 92%, 50%)"
                fillOpacity={1}
                fill="url(#colorKva)"
                strokeWidth={2}
                name="kVA"
              />
              <Area
                type="monotone"
                dataKey="installations"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorInstallations)"
                strokeWidth={2}
                name="Installations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}