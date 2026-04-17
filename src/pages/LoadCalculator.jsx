import { useState, useMemo, useEffect } from "react";
import { Zap, Tv, Wind, Laptop, Thermometer, Package, RotateCcw, Flame, Lightbulb, Snowflake, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ApplianceRow from "@/components/calculator/ApplianceRow";

const APPLIANCES = [
  { name: "Television", power: 150, icon: Tv, iconColor: "bg-blue-500/10 text-blue-600" },
  { name: "Freezer", power: 200, icon: Thermometer, iconColor: "bg-cyan-500/10 text-cyan-600" },
  { name: "Bulb", power: 60, icon: Lightbulb, iconColor: "bg-yellow-500/10 text-yellow-600" },
  { name: "Fan", power: 75, icon: Wind, iconColor: "bg-sky-500/10 text-sky-600" },
  { name: "Laptop", power: 50, icon: Laptop, iconColor: "bg-indigo-500/10 text-indigo-600" },
  { name: "Air Conditioner", power: 1000, icon: Snowflake, iconColor: "bg-teal-500/10 text-teal-600" },
  { name: "Refrigerator", power: 150, icon: Package, iconColor: "bg-green-500/10 text-green-600" },
  { name: "Washing Machine", power: 500, icon: RotateCcw, iconColor: "bg-purple-500/10 text-purple-600" },
  { name: "Microwave", power: 1200, icon: Flame, iconColor: "bg-orange-500/10 text-orange-600" },
];

const DEFAULT_HOURS = 4;

export default function LoadCalculator() {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(APPLIANCES.map((a) => [a.name, 0]))
  );
  const [hours, setHours] = useState(() =>
    Object.fromEntries(APPLIANCES.map((a) => [a.name, DEFAULT_HOURS]))
  );

  useEffect(() => {
    const saved = localStorage.getItem("solarLoadData");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            // This is a bit complex to restore perfectly since source might have changed,
            // but for now we'll just start fresh if the user wants.
        } catch (e) {}
    }
  }, []);

  const stats = useMemo(() => {
    const peakWatts = APPLIANCES.reduce((sum, a) => sum + a.power * (quantities[a.name] || 0), 0);
    const dailyKWh = APPLIANCES.reduce(
      (sum, a) => sum + (a.power * (quantities[a.name] || 0) * (hours[a.name] || DEFAULT_HOURS)) / 1000,
      0
    );
    const selectedCount = Object.values(quantities).filter((q) => q > 0).length;
    return { peakWatts, dailyKWh, selectedCount };
  }, [quantities, hours]);

  const handleContinue = () => {
    localStorage.setItem("solarLoadData", JSON.stringify({
      peakWatts: stats.peakWatts,
      dailyKWh: stats.dailyKWh,
      selectedCount: stats.selectedCount,
    }));
    navigate("/solar-installation");
  };

  return (
    <div className="space-y-8 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Household Load Calculator</h1>
            <p className="text-sm text-muted-foreground">Select appliances, quantities, and daily usage hours</p>
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3">
        {APPLIANCES.map((appliance) => (
          <ApplianceRow
            key={appliance.name}
            name={appliance.name}
            power={appliance.power}
            quantity={quantities[appliance.name]}
            hours={hours[appliance.name]}
            icon={appliance.icon}
            iconColor={appliance.iconColor}
            onChange={(val) => setQuantities((prev) => ({ ...prev, [appliance.name]: val }))}
            onHoursChange={(val) => setHours((prev) => ({ ...prev, [appliance.name]: val }))}
          />
        ))}
      </div>

      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="sticky bottom-4 rounded-2xl bg-card border border-border shadow-xl p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Appliances</p>
              <p className="font-heading text-2xl font-bold">{stats.selectedCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Peak Load</p>
              <p className="font-heading text-2xl font-bold">
                {(stats.peakWatts / 1000).toFixed(2)}<span className="text-sm text-muted-foreground font-normal"> kW</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily Usage</p>
              <p className="font-heading text-2xl font-bold text-primary">
                {stats.dailyKWh.toFixed(2)}<span className="text-sm text-muted-foreground font-normal"> kWh</span>
              </p>
            </div>
          </div>
          {stats.selectedCount > 0 && (
            <Button onClick={handleContinue} className="rounded-xl font-heading font-semibold shadow-lg shadow-primary/20 whitespace-nowrap">
              Next: Size Solar System <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
