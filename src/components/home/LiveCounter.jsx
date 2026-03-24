import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LiveCounter({ value, label, sublabel, icon: Icon, delay = 0, isGreen = false }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let currentStep = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.min(Math.round(stepValue * currentStep), value));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="relative group h-full"
    >
      <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-300 ${isGreen ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-primary/20 group-hover:bg-primary/30'}`} />
      <div className={`relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 transition-all duration-300 h-full flex flex-col ${isGreen ? 'hover:border-green-500/50' : 'hover:border-primary/50'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${isGreen ? 'bg-green-500/10' : 'bg-primary/10'}`}>
            <Icon className={`w-6 h-6 ${isGreen ? 'text-green-500' : 'text-primary'}`} />
          </div>
          {sublabel && (
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${isGreen ? 'text-green-500 bg-green-500/10' : 'text-primary bg-primary/10'}`}>
              {sublabel}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {formatNumber(displayValue)}
          </div>
          <div className="text-sm text-muted-foreground leading-tight">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}