import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Medal, Award, ChevronRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LeaderboardTable({ installers, metric }) {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 text-center text-muted-foreground font-medium">{rank}</span>;
  };

  const getMetricValue = (installer) => {
    switch (metric) {
      case 'kva':
        return `${(installer.total_kva || 0).toLocaleString()} kVA`;
      case 'panels':
        return `${(installer.total_panels || 0).toLocaleString()} panels`;
      case 'installations':
        return `${(installer.total_installations || 0).toLocaleString()} projects`;
      default:
        return installer.total_kva || 0;
    }
  };

  const sortedInstallers = [...installers].sort((a, b) => {
    const aVal = a[`total_${metric === 'installations' ? 'installations' : metric}`] || 0;
    const bVal = b[`total_${metric === 'installations' ? 'installations' : metric}`] || 0;
    return bVal - aVal;
  });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Installer</div>
        <div className="col-span-2">Country</div>
        <div className="col-span-3 text-right">
          {metric === 'kva' && 'Total kVA'}
          {metric === 'panels' && 'Total Panels'}
          {metric === 'installations' && 'Total Projects'}
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {sortedInstallers.map((installer, index) => (
          <Link
            key={installer.id}
            to={createPageUrl('InstallerProfile') + `?id=${installer.id}`}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors items-center"
          >
            <div className="col-span-1 flex items-center">
              {getRankIcon(index + 1)}
            </div>
            <div className="col-span-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {installer.company_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    {installer.company_name}
                    {installer.verified && (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {installer.years_of_experience || 0} years experience
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <Badge variant="secondary">{installer.country}</Badge>
            </div>
            <div className="col-span-3 text-right">
              <span className="text-lg font-semibold text-primary">
                {getMetricValue(installer)}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        ))}

        {sortedInstallers.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No installers found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}