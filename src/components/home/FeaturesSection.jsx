import React from 'react';
import { motion } from 'framer-motion';
import { Database, Trophy, MapPin, Shield, TrendingUp, Globe } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: 'Structured Data Registry',
    description: 'Every installation captured with detailed specifications - panels, batteries, inverters, and location data.'
  },
  {
    icon: Trophy,
    title: 'Installer Leaderboards',
    description: 'Gamified rankings showcasing top performers by kVA installed, panels deployed, and project count.'
  },
  {
    icon: MapPin,
    title: 'Geographic Analytics',
    description: 'Interactive maps showing solar penetration across countries, states, and cities.'
  },
  {
    icon: Shield,
    title: 'Verified Records',
    description: 'Admin-approved installations ensuring data integrity and reliability for stakeholders.'
  },
  {
    icon: TrendingUp,
    title: 'Growth Tracking',
    description: 'Monitor monthly trends, year-over-year growth, and emerging solar hotspots.'
  },
  {
    icon: Globe,
    title: 'Pan-African Coverage',
    description: 'From Nigeria to South Africa, tracking solar growth across the entire continent.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Solar Intelligence Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            CoSolar combines data collection, analytics, and community to create 
            Africa's definitive solar installation registry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}