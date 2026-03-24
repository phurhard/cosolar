import React from 'react';
import { motion } from 'framer-motion';
import { Database, Award, LineChart, Shield } from 'lucide-react';

const missions = [
  {
    icon: Database,
    title: "Track Every Installation",
    description: "Building Africa's most comprehensive solar database—verified, structured, and accessible."
  },
  {
    icon: Award,
    title: "Celebrate the Champions",
    description: "Recognize top installers through public leaderboards and verifiable achievement records."
  },
  {
    icon: LineChart,
    title: "Prove the Progress",
    description: "Show investors, governments, and the world that Africa's solar revolution is real and measurable."
  },
  {
    icon: Shield,
    title: "Build Trust Through Data",
    description: "Admin-verified records create credibility for installers and confidence for customers."
  }
];

export default function MissionSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why CoSolar Exists
            </h2>
            <p className="text-lg text-muted-foreground">
              We're not just tracking data. We're building the infrastructure for Africa's energy future.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map((mission, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex gap-4 p-6 bg-card/50 border border-border rounded-xl hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <mission.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {mission.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}