import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
  LabelList,
} from "recharts";
import { ChartCard } from "./ChartCard";

export interface BarChartDataItem {
  name: string;
  value: number;
}

interface SimpleBarChartProps {
  title: string;
  description?: string;
  data: BarChartDataItem[];
  color?: string;
  icon?: "map-pin" | "credit-card" | "package";
  colSpan?: 1 | 2;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomCursor = (props: any) => {
  const { x, y, width, height } = props;
  return (
    <g>
      <rect
        x={x + 2}
        y={y + 2}
        width={width}
        height={height}
        fill="#000"
        opacity={0.2}
        rx={8}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#3f3f46"
        opacity={0.6}
        rx={8}
        stroke="#71717a"
        strokeWidth={1}
      />
    </g>
  );
};

export function SimpleBarChart({
  title,
  description,
  data,
  color = "#3b82f6",
  icon,
  colSpan,
}: SimpleBarChartProps) {
  const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
    const isVisible = active && payload && payload.length;
    return (
      <div
        style={{ visibility: isVisible ? "visible" : "hidden" }}
        className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 shadow-lg"
      >
        {isVisible && (
          <div className="flex flex-col gap-1 text-zinc-50 text-sm">
            <p className="text-zinc-400 font-medium">{label}</p>
            <p className="font-semibold">{payload[0].value}</p>
          </div>
        )}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    if (!value || height < 20) return null;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontWeight={600}
        pointerEvents="none"
      >
        {value}
      </text>
    );
  };

  return (
    <ChartCard
      title={title}
      description={description}
      icon={icon}
      colSpan={colSpan}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={CustomTooltip} cursor={<CustomCursor />} />
          <Bar dataKey="value" fill={color} radius={6}>
            <LabelList content={CustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
