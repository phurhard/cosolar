import React from 'react';
import { Badge } from '@/components/ui/badge';

const CATEGORY_STYLES = {
  General: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'Installation Tips': 'bg-primary/10 text-primary border-primary/20',
  'Equipment Reviews': 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  Troubleshooting: 'bg-destructive/10 text-destructive border-destructive/20',
  'Success Stories': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Marketplace: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

export const FORUM_CATEGORIES = [
  'All',
  'General',
  'Installation Tips',
  'Equipment Reviews',
  'Troubleshooting',
  'Success Stories',
  'Marketplace',
];

export default function CategoryBadge({ category, onClick, active, className = '' }) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.General;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(category)}
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all
          ${active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
          ${category === 'All' ? 'bg-secondary text-foreground border-border' : style}
          ${className}`}
      >
        {category}
      </button>
    );
  }

  return (
    <Badge variant="outline" className={`${style} ${className}`}>
      {category}
    </Badge>
  );
}
