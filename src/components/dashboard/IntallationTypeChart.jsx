import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function InstallationTypeChart({ installations }) {
  const data = useMemo(() => {
    const typeData = {};
    
    installations.forEach(inst => {
      const type = inst.installation_type || 'Other';
      if (!typeData[type]) {
        typeData[type] = { name: type, value: 0, kva: 0 };
      }
      typeData[type].value += 1;
      typeData[type].kva += inst.system_size_kva || 0;
    });

    return Object.values(typeData);
  }, [installations]);

  const colors = [
    'hsl(38, 92%, 50%)',
    'hsl(142, 76%, 36%)',
    'hsl(221, 83%, 53%)',
    'hsl(262, 83%, 58%)',
    'hsl(0, 84%, 60%)',
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Installation Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value, name, props) => [
                  `${value} installations (${props.payload.kva.toLocaleString()} kVA)`,
                  props.payload.name
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}