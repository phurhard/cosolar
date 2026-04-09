import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ApplianceRow({ name, power, quantity, hours, onChange, onHoursChange, icon: Icon, iconColor }) {
  return (
    <div className={`rounded-xl border bg-card transition-all duration-200 ${quantity > 0 ? "border-primary/30 shadow-sm shadow-primary/5" : "border-border"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{power}W each</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange(Math.max(0, quantity - 1))} disabled={quantity === 0}>
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <span className="w-7 text-center font-semibold text-sm">{quantity}</span>
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onChange(quantity + 1)}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {quantity > 0 && (
        <div className="px-4 pb-3 flex items-center gap-2 border-t border-border/50 pt-2.5">
          <span className="text-xs text-muted-foreground flex-1">Daily usage hours:</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => onHoursChange(Math.max(0.5, hours - 0.5))}>
              <Minus className="w-2.5 h-2.5" />
            </Button>
            <Input
              type="number"
              min={0.5}
              max={24}
              step={0.5}
              value={hours}
              onChange={(e) => onHoursChange(parseFloat(e.target.value) || 1)}
              className="w-16 h-6 text-xs text-center px-1"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={() => onHoursChange(Math.min(24, hours + 0.5))}>
              <Plus className="w-2.5 h-2.5" />
            </Button>
            <span className="text-xs text-muted-foreground">hrs</span>
          </div>
          <span className="text-xs font-medium text-primary ml-2">
            {((power * quantity * hours) / 1000).toFixed(2)} kWh/day
          </span>
        </div>
      )}
    </div>
  );
}
