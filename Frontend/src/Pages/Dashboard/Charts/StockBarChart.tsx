import { ChartCard } from "./ChartCard";

interface StockBarChartProps {
  available: number;
  reserved: number;
  sold: number;
}

const SEGMENTS = [
  { key: "available", label: "Disponível", color: "#22c55e" },
  { key: "reserved", label: "Reservado", color: "#f59e0b" },
  { key: "sold", label: "Vendido", color: "#3b82f6" },
] as const;

export function StockBarChart({
  available,
  reserved,
  sold,
}: StockBarChartProps) {
  const values = { available, reserved, sold };
  const total = available + reserved + sold;
  return (
    <ChartCard
      title="Distribuição do Estoque"
      description="Disponível · Reservado · Vendido"
      icon="package"
      colSpan={2}
      height="h-28"
    >
      <div className="flex flex-col gap-4 justify-center h-full">
        <div className="w-full h-5.5 rounded-full overflow-hidden flex">
          {SEGMENTS.map(({ key, color }) => {
            const pct = (values[key] / total) * 100;
            return (
              <div
                key={key}
                title={`${values[key].toLocaleString("pt-BR")} (${pct.toFixed(1)}%)`}
                style={{ width: `${pct}%`, background: color }}
                className="h-full transition-opacity hover:opacity-80"
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-5 justify-between">
          {SEGMENTS.map(({ key, label, color }) => {
            const pct = ((values[key] / total) * 100).toFixed(1);
            return (
              <div key={key} className="flex items-center  gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="text-sm font-medium text-zinc-100">
                  {values[key].toLocaleString("pt-BR")}
                </span>
                <span className="text-xs text-zinc-500">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}
