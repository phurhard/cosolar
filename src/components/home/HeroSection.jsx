import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Battery, CheckCircle, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HeroSection({ stats }) {
  const statCards = [
    {
      icon: Layers,
      value: stats?.totalPanels || 0,
      label: 'Solar Panels Tracked',
      sublabel: 'panels',
      growth: '12%'
    },
    {
      icon: Zap,
      value: stats?.totalKva || 0,
      label: 'Total Capacity',
      sublabel: 'kVA',
      growth: '18%'
    },
    {
      icon: Battery,
      value: stats?.totalBatteries || 0,
      label: 'Battery Systems',
      sublabel: 'units',
      growth: '9%'
    },
    {
      icon: CheckCircle,
      value: stats?.totalInstallations || 0,
      label: 'Verified Installations',
      sublabel: 'projects',
      growth: '15%'
    }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">Live Data Tracking</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Tracking Africa's
              <span className="block text-primary">Solar Growth</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground mb-10 max-w-xl">
              The central database for solar installations across Nigeria and Africa. 
              Real-time capacity tracking, installer recognition, and verified data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base rounded-xl w-full sm:w-auto">
                  <BarChart3 className="mr-2 w-5 h-5" />
                  View Live Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl('SubmitInstallation')}>
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary px-8 py-6 text-base rounded-xl w-full sm:w-auto">
                  Register Installation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                        {stat.growth}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                          {stat.value.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stat.sublabel}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}