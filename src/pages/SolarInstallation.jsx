import { useState, useEffect } from "react";
import { Sun, Battery, Cpu, LayoutGrid, Info, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import GenericResultCard from "../components/calculator/GenericResultCard";
import { useNavigate } from "react-router-dom";

export default function SolarInstallation() {
  const navigate = useNavigate();
  const [importedLoad, setImportedLoad] = useState(null);
  const [form, setForm] = useState({
    loadKWh: 1,
    peakWatts: 0,
    panelRating: 300,
    sunshine: 5,
    seasonalEnabled: false,
    winterSunshine: 4,
    summerSunshine: 6,
  });
  const [results, setResults] = useState(null);
  const [prices, setPrices] = useState(null);
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [priceTimestamp, setPriceTimestamp] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("solarLoadData");
    if (saved) {
      const data = JSON.parse(saved);
      setImportedLoad(data);
      setForm((prev) => ({
        ...prev,
        loadKWh: parseFloat(data.dailyKWh.toFixed(2)),
        peakWatts: data.peakWatts || 0,
      }));
    }
  }, []);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const fetchPrices = async () => {
    setFetchingPrices(true);
    // Mimic price fetching from local estimates instead of base44 LLM
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const estimates = {
      battery_price: 450000, // Estimated market price in Naira
      inverter_price: 1800000,
      panel_price: 120000
    };
    
    setPrices(estimates);
    setPriceTimestamp(new Date().toLocaleTimeString());
    setFetchingPrices(false);
    return estimates;
  };

  const calculate = async () => {
    const sunshine = form.seasonalEnabled
      ? (form.winterSunshine + form.summerSunshine) / 2
      : form.sunshine;

    // Inverter: peak load + 20%
    const peakKW = form.peakWatts > 0 ? form.peakWatts / 1000 : form.loadKWh / 24;
    const inverterKW = peakKW * 1.2;
    const inverterKVA = Math.ceil(inverterKW * 10) / 10;

    // Battery: 80% of daily usage
    const totalStorageKWh = form.loadKWh * 0.8;

    // Lithium battery configs (kWh rated)
    const configs = [
      { label: "1 kWh Lithium", kWh: 1 },
      { label: "2 kWh Lithium", kWh: 2 },
      { label: "5 kWh Lithium", kWh: 5 },
      { label: "10 kWh Lithium", kWh: 10 },
    ];
    const bestConfig = configs.reduce((prev, curr) =>
      Math.abs(curr.kWh - totalStorageKWh) < Math.abs(prev.kWh - totalStorageKWh) ? curr : prev
    );
    const recommendedUnits = Math.ceil(totalStorageKWh / bestConfig.kWh);

    // Panels: generate 120% of daily usage (20% surplus)
    const targetGeneration = form.loadKWh * 1.2;
    const kWhPerPanelPerDay = (form.panelRating * sunshine * 0.8) / 1000;
    const numberOfPanels = Math.ceil(targetGeneration / kWhPerPanelPerDay);
    const totalPanelKW = (numberOfPanels * form.panelRating) / 1000;
    const dailyGeneration = totalPanelKW * sunshine * 0.8;

    // Fetch local estimates
    const livePrices = await fetchPrices();
    const batteryUnitCost = livePrices?.battery_price || 450000;
    const panelUnitCost = livePrices?.panel_price || 120000;
    const inverterUnitCost = livePrices?.inverter_price || 1800000;

    const totalBatteryCost = recommendedUnits * batteryUnitCost;
    const totalPanelCost = numberOfPanels * panelUnitCost;
    const totalInverterCost = inverterUnitCost;
    const totalCost = totalBatteryCost + totalPanelCost + totalInverterCost;

    setResults({
      // Battery
      totalStorageKWh: totalStorageKWh.toFixed(2),
      batteryConfig: bestConfig.label,
      recommendedUnits,
      totalBatteryCost,
      // Inverter
      inverterKVA,
      totalInverterCost,
      // Panels
      numberOfPanels,
      panelRating: form.panelRating,
      totalPanelKW: totalPanelKW.toFixed(2),
      dailyGeneration: dailyGeneration.toFixed(2),
      totalPanelCost,
      // Total
      totalCost,
      loadKWh: form.loadKWh,
      usingLivePrices: true,
    });
  };

  const fmt = (n) => `₦${n.toLocaleString()}`;

  return (
    <div className="space-y-8 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Solar System Specifications</h1>
            <p className="text-sm text-muted-foreground">Enter your panel rating and we'll size your full system</p>
          </div>
        </div>
      </motion.div>

      {/* Imported load banner */}
      {importedLoad ? (
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-3">
          <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm flex-1">
            <span className="font-semibold text-primary">Load imported: </span>
            <span className="text-muted-foreground">
              {importedLoad.selectedCount} appliances · <strong>{(importedLoad.peakWatts / 1000).toFixed(2)} kW peak</strong> · {importedLoad.dailyKWh.toFixed(2)} kWh/day
            </span>
          </div>
          <button className="text-xs text-muted-foreground underline hover:text-foreground" onClick={() => navigate("/load-calculator")}>Edit</button>
        </div>
      ) : (
        <div className="rounded-xl bg-muted border border-border px-4 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <button className="underline text-primary" onClick={() => navigate("/load-calculator")}>Run the Load Calculator first</button> for accurate peak load — or enter your daily kWh manually below.
          </p>
        </div>
      )}

      {/* Input grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <FieldCard label="Daily Load (kWh)">
          <Input type="number" min={0.1} step={0.1} value={form.loadKWh} onChange={(e) => update("loadKWh", parseFloat(e.target.value) || 0)} />
        </FieldCard>
        <FieldCard label="Solar Panel Rating (W)">
          <Input type="number" min={100} step={50} value={form.panelRating} onChange={(e) => update("panelRating", parseInt(e.target.value) || 100)} />
        </FieldCard>
        <FieldCard label="Sunshine Hours / Day">
          <Input type="number" min={1} step={0.5} value={form.sunshine} onChange={(e) => update("sunshine", parseFloat(e.target.value) || 1)} disabled={form.seasonalEnabled} />
        </FieldCard>
        <FieldCard label="Seasonal Variation">
          <div className="flex items-center gap-3 h-10">
            <Switch checked={form.seasonalEnabled} onCheckedChange={(v) => update("seasonalEnabled", v)} />
            <span className="text-sm text-muted-foreground">{form.seasonalEnabled ? "Enabled" : "Disabled"}</span>
          </div>
        </FieldCard>
        {form.seasonalEnabled && (
          <>
            <FieldCard label="Winter Sunshine Hours">
              <Input type="number" min={1} step={0.5} value={form.winterSunshine} onChange={(e) => update("winterSunshine", parseFloat(e.target.value) || 1)} />
            </FieldCard>
            <FieldCard label="Summer Sunshine Hours">
              <Input type="number" min={1} step={0.5} value={form.summerSunshine} onChange={(e) => update("summerSunshine", parseFloat(e.target.value) || 1)} />
            </FieldCard>
          </>
        )}
      </div>

      <Button onClick={calculate} size="lg" className="rounded-xl font-heading font-semibold shadow-lg shadow-primary/20" disabled={fetchingPrices}>
        {fetchingPrices ? (
          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Fetching Estimates & Calculating...</>
        ) : (
          <><Sun className="w-4 h-4 mr-2" />Calculate & Get Local Estimates</>
        )}
      </Button>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-bold">System Recommendation</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              Market Estimates
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Battery */}
            <GenericResultCard
              title="Battery Bank"
              icon={Battery}
              color="bg-amber-500/10 text-amber-600"
              items={[
                { label: "Capacity needed", value: `${results.totalStorageKWh} kWh` },
                { label: "Recommended config", value: results.batteryConfig },
                { label: "Units needed", value: `${results.recommendedUnits} units` },
                { label: "Estimated cost", value: fmt(results.totalBatteryCost) },
              ]}
            />

            <GenericResultCard
              title="Inverter"
              icon={Cpu}
              color="bg-blue-500/10 text-blue-600"
              items={[
                { label: "Capacity (peak +20%)", value: `${results.inverterKVA} kVA` },
                { label: "Estimated cost", value: fmt(results.totalInverterCost) },
              ]}
            />

            <GenericResultCard
              title="Solar Panels"
              icon={LayoutGrid}
              color="bg-primary/10 text-primary"
              items={[
                { label: "Panels required", value: `${results.numberOfPanels} units` },
                { label: "Panel rating", value: `${results.panelRating}W` },
                { label: "Total array", value: `${results.totalPanelKW} kWp` },
                { label: "Daily generation", value: `${results.dailyGeneration} kWh` },
                { label: "Estimated cost", value: fmt(results.totalPanelCost) },
              ]}
            />
          </div>

          {/* Total cost + continue */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Estimated Investment</p>
              <p className="font-heading text-4xl font-bold text-primary">{fmt(results.totalCost)}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl font-heading font-semibold"
              onClick={() => {
                localStorage.setItem("solarInstallationData", JSON.stringify({ totalCost: results.totalCost }));
                navigate("/cost-benefit");
              }}
            >
              Analyse ROI <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
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
