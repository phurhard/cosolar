import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const features = [
  {
    icon: Zap,
    title: "Load Calculation",
    description: "Estimate your household energy load based on your appliances and usage patterns.",
    path: createPageUrl("LoadCalculator"),
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Sun,
    title: "Solar Sizing",
    description: "Determine the exact specifications for your solar setup — panels, batteries, and inverter.",
    path: createPageUrl("SolarInstallation"),
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Cost-Benefit",
    description: "Analyze the financial benefits of switching to solar energy versus traditional fuel.",
    path: createPageUrl("CostBenefit"),
    color: "bg-blue-500/10 text-blue-600",
  },
];

export default function CalculatorsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Solar Project Calculators
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your solar journey with our integrated suite of tools. 
            From load estimation to financial analysis.
            </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <Link
                  to={feature.path}
                  className="group block h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    Start calculating <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
