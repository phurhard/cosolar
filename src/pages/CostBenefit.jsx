import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Fuel, Info, Zap, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function CostBenefit() {
  const navigate = useNavigate();
  const [importedInstall, setImportedInstall] = useState(null);
  const [form, setForm] = useState({
    installationCost: 2000000,
    fuelConsumption: 1.5,
    fuelPrice: 850,
    usageHours: 8,
  });
  const [results, setResults] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("solarInstallationData");
    if (saved) {
      const data = JSON.parse(saved);
      setImportedInstall(data);
      setForm((prev) => ({ ...prev, installationCost: data.totalCost }));
    }
  }, []);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const calculate = () => {
    const dailyFuelLiters = form.fuelConsumption * form.usageHours;
    const dailyFuelCost = dailyFuelLiters * form.fuelPrice;
    const monthlyFuelCost = dailyFuelCost * 30;
    const annualFuelCost = monthlyFuelCost * 12;

    const annualSavings = annualFuelCost; // Assuming solar replaces 100% of generator usage
    const paybackMonths = form.installationCost / monthlyFuelCost;
    
    const fiveYearSavings = (annualSavings * 5) - form.installationCost;
    const tenYearSavings = (annualSavings * 10) - form.installationCost;
    const roi = (tenYearSavings / form.installationCost) * 100;

    setResults({
      totalSolarCost: form.installationCost,
      monthlyFuelCost: Math.round(monthlyFuelCost),
      annualFuelCost: Math.round(annualFuelCost),
      paybackMonths: Math.round(paybackMonths),
      paybackYears: (paybackMonths / 12).toFixed(1),
      annualSavings: Math.round(annualSavings),
      fiveYearSavings: Math.round(fiveYearSavings),
      tenYearSavings: Math.round(tenYearSavings),
      roi: Math.round(roi),
    });
  };

  const fmt = (n) => `₦${Number(n).toLocaleString()}`;

  return (
    <div className="space-y-8 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Cost-Benefit Analysis</h1>
            <p className="text-sm text-muted-foreground">Compare solar energy investment against traditional fuel expenses</p>
          </div>
        </div>
      </motion.div>

      {/* Import banners */}
      {importedInstall ? (
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm flex-1">
            <span className="font-semibold text-primary">Installation cost imported: </span>
            <span className="text-muted-foreground">{fmt(importedInstall.totalCost)} from your Solar Installation calculation</span>
          </p>
          <button className="text-xs text-muted-foreground underline hover:text-foreground ml-auto" onClick={() => navigate("/solar-installation")}>Edit</button>
        </div>
      ) : (
        <div className="rounded-xl bg-muted border border-border px-4 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Run the <button className="underline text-primary" onClick={() => navigate("/solar-installation")}>Solar Installation Calculator</button> first to auto-fill your investment cost.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <FieldCard label="Solar Installation Cost (₦)">
          <Input type="number" min={0} step={500} value={form.installationCost} onChange={(e) => update("installationCost", parseFloat(e.target.value) || 0)} />
        </FieldCard>
        <FieldCard label="Fuel Consumption (liters/hour)">
          <Input type="number" min={0} step={0.5} value={form.fuelConsumption} onChange={(e) => update("fuelConsumption", parseFloat(e.target.value) || 0)} />
        </FieldCard>
        <FieldCard label="Fuel Price (₦/liter)">
          <Input type="number" min={0} step={10} value={form.fuelPrice} onChange={(e) => update("fuelPrice", parseFloat(e.target.value) || 0)} />
        </FieldCard>
        <FieldCard label="Generator Usage Hours / Day">
          <Input type="number" min={0} step={1} max={24} value={form.usageHours} onChange={(e) => update("usageHours", parseFloat(e.target.value) || 0)} />
        </FieldCard>
      </div>

      <Button onClick={calculate} size="lg" className="w-full sm:w-auto rounded-xl font-heading font-semibold shadow-lg shadow-primary/20">
        <TrendingUp className="w-4 h-4 mr-2" />
        Analyse Cost-Benefit
      </Button>

      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
          <h2 className="font-heading text-xl font-bold">Financial Analysis</h2>

          {/* Cost comparison */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-semibold">Solar Investment</h3>
              </div>
              <p className="font-heading text-3xl font-bold text-primary">{fmt(results.totalSolarCost)}</p>
              <p className="text-sm text-muted-foreground mt-1">One-time investment</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Fuel className="w-4 h-4 text-amber-600" />
                <h3 className="font-heading font-semibold">Fuel Costs</h3>
              </div>
              <p className="font-heading text-3xl font-bold text-amber-600">{fmt(results.monthlyFuelCost)}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-1">{fmt(results.annualFuelCost)} per year</p>
            </div>
          </div>

          {/* Payback + ROI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Payback Period", value: results.paybackMonths === Infinity ? "N/A" : `${results.paybackYears} yrs`, sub: results.paybackMonths === Infinity ? "" : `${results.paybackMonths} mos`, color: "text-primary" },
              { label: "Annual Savings", value: fmt(results.annualSavings), sub: "after switching", color: "text-green-600" },
              { label: "5-Year Net", value: results.fiveYearSavings >= 0 ? `+${fmt(results.fiveYearSavings)}` : fmt(results.fiveYearSavings), sub: "vs staying on fuel", color: results.fiveYearSavings >= 0 ? "text-green-600" : "text-red-500" },
              { label: "10-Year ROI", value: `${results.roi}%`, sub: "return on investment", color: results.roi >= 0 ? "text-green-600" : "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                <p className={`font-heading text-xl font-bold ${s.color}`}>{s.value}</p>
                {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className={`rounded-2xl p-6 border ${results.paybackMonths <= 36 ? "bg-green-500/5 border-green-500/20" : results.paybackMonths <= 72 ? "bg-amber-500/5 border-amber-500/20" : "bg-muted border-border"}`}>
            <div className="flex items-start gap-3">
              <Leaf className={`w-5 h-5 mt-0.5 ${results.paybackMonths <= 36 ? "text-green-600" : results.paybackMonths <= 72 ? "text-amber-600" : "text-muted-foreground"}`} />
              <div>
                <p className="font-heading font-semibold mb-1">
                  {results.paybackMonths <= 36 ? "Excellent Investment" : results.paybackMonths <= 72 ? "Good Investment" : "Long-term Investment"}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {results.paybackMonths === Infinity
                    ? "Enter your fuel cost details to see payback analysis."
                    : `Your solar system pays for itself in ${results.paybackYears} years. Over 10 years, you'll ${results.tenYearSavings >= 0 ? `save ${fmt(results.tenYearSavings)}` : `net ${fmt(results.tenYearSavings)}`} compared to running a generator.`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FieldCard({ label, children }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}
