export default function GenericResultCard({ title, icon: Icon, color, items }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <h3 className="font-heading font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-heading font-semibold text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
