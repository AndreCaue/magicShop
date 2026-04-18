import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";

export interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  description?: string;
  data: DonutChartDataItem[];
  icon?: "users" | "credit-card" | "package";
}

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 10;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#a1a1aa"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      <tspan fontWeight={500} fill="#e4e4e7">
        {name}
      </tspan>
      <tspan fill="#71717a">{`: ${((percent ?? 0) * 100).toFixed(0)}%`}</tspan>
    </text>
  );
};

export function DonutChart({
  title,
  description,
  data,
  icon,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const { name, value, payload: itemPayload } = payload[0];
    const color = itemPayload.color;

    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 shadow-lg">
        <p style={{ color }} className="font-semibold text-sm">
          {name}
        </p>
        <p className="text-zinc-300 text-sm italic">
          {value.toLocaleString("pt-BR")}
          <span className="text-zinc-500 ml-1">
            ({Math.round((value / total) * 100)}%)
          </span>
        </p>
      </div>
    );
  };

  return (
    <ChartCard title={title} description={description} icon={icon}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
          {" "}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={{
              stroke: "#52525b",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => {
              if (typeof value !== "number") return value;
              return `${value.toLocaleString("pt-BR")} (${Math.round((value / total) * 100)}%)`;
            }}
            content={CustomTooltip}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
