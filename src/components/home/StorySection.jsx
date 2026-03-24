import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, TrendingUp, Target } from 'lucide-react';

const stories = [
  {
    icon: Lightbulb,
    title: "The Problem We're Solving",
    description: "Millions across Africa lack reliable electricity. Traditional grids can't reach everyone. But the sun shines everywhere—and solar works.",
    color: "primary"
  },
  {
    icon: Users,
    title: "The Heroes Making It Happen",
    description: "From Lagos to Nairobi, solar installers are transforming communities. CoSolar gives them recognition, data, and a platform to showcase their impact.",
    color: "accent"
  },
  {
    icon: TrendingUp,
    title: "The Movement Growing Daily",
    description: "Every installation we track represents a family with light, a business with power, a community taking control of its energy future.",
    color: "chart-3"
  },
  {
    icon: Target,
    title: "The Vision for Tomorrow",
    description: "A fully mapped solar ecosystem. Data that attracts investment. Recognition that drives competition. Evidence that Africa leads the energy transition.",
    color: "primary"
  }
];

export default function StorySection() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              More Than Just Numbers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This is the story of how Africa is powering itself—one solar installation at a time
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-${story.color}/5 rounded-2xl blur-xl group-hover:bg-${story.color}/10 transition-all`} />
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/30 transition-all">
                <div className={`w-14 h-14 bg-${story.color}/10 rounded-xl flex items-center justify-center mb-4`}>
                  <story.icon className={`w-7 h-7 text-${story.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {story.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {story.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}