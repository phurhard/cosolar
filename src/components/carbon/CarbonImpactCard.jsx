import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, DollarSign, TreePine, Car, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CarbonImpactCard({ carbonTonsAnnual, carbonTonsLifetime, creditValue, compact = false }) {
  // Equivalencies
  const treesEquivalent = Math.round(carbonTonsLifetime * 48); // 1 ton CO2 = ~48 trees over 25 years
  const carsOffRoad = Math.round(carbonTonsAnnual / 4.6); // Average car emits 4.6 tons CO2/year
  const homesEquivalent = Math.round(carbonTonsAnnual / 7.5); // Average home emits 7.5 tons CO2/year

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {carbonTonsAnnual.toLocaleString()} tons/yr
              </div>
              <div className="text-xs text-muted-foreground">CO₂ Offset</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Impact Card */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Carbon Impact</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-accent">
                {carbonTonsAnnual.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">tons CO₂/year</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-accent">
                {carbonTonsLifetime.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">tons lifetime (25yr)</div>
            </motion.div>
          </div>

          {/* Market Value */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 rounded-lg p-4 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Carbon Credit Value</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                ${creditValue.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              @ $15/ton (voluntary market rate)
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Equivalencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border hover:border-accent/30 transition-colors">
            <CardContent className="p-4 text-center">
              <TreePine className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {treesEquivalent.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Trees planted equivalent
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card border-border hover:border-accent/30 transition-colors">
            <CardContent className="p-4 text-center">
              <Car className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {carsOffRoad.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Cars off the road/year
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-card border-border hover:border-accent/30 transition-colors">
            <CardContent className="p-4 text-center">
              <Home className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {homesEquivalent.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Homes powered cleanly/year
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
