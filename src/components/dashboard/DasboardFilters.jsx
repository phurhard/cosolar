import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

const countries = [
  'All Countries',
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Egypt',
  'Morocco',
  'Tanzania',
  'Ethiopia',
  'Rwanda',
  'Uganda',
  'Senegal',
  'Cameroon',
  'Ivory Coast',
  'Other'
];

const years = ['All Years', '2024', '2023', '2022', '2021', '2020'];

const installationTypes = [
  'All Types',
  'Residential',
  'Commercial',
  'Industrial',
  'Agricultural',
  'Institutional'
];

export default function DashboardFilters({ filters, onFilterChange, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select
        value={filters.country}
        onValueChange={(value) => onFilterChange('country', value)}
      >
        <SelectTrigger className="w-40 bg-background">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map(country => (
            <SelectItem key={country} value={country}>{country}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.year}
        onValueChange={(value) => onFilterChange('year', value)}
      >
        <SelectTrigger className="w-32 bg-background">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={year}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type}
        onValueChange={(value) => onFilterChange('type', value)}
      >
        <SelectTrigger className="w-40 bg-background">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {installationTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>
    </div>
  );
}