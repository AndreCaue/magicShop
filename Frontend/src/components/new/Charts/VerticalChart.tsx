import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  type NameType,
  type ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/charts";
import { cn } from "@/lib/utils";
import ChartTitle from "./ChartTitle";
import AutoHeight from "./AutoHeight";
import StatusPlaceholder from "./StatusPlaceholder";

type TChartData = {
  name: string;
  value: number;
  color?: string;
};

type TData = {
  data?: TChartData[];
  isLoading: boolean;
  error: boolean;
};

type TProps = {
  title: string;
  chartData: TData;
  refreshRequest: () => void;
  Tooltip?: (props: TooltipProps<ValueType, NameType>) => React.ReactNode;
  colors?: string[];
  smallGapBetweenBars?: boolean;
  valueOnBar?: boolean;
  coloredTick?: boolean;
  showToggle?: boolean;
  decimal?: boolean;
  hideYAxis?: boolean;
  cardSuffix?: string;
  maxBarSize?: number;
  className?: string;
  chartClassName?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  maxHeight?: number;
  reduceWidthOnDesktop?: boolean;
};

type ColoredTickProps = {
  x?: number | string;
  y?: number | string;
  payload: ITickItem;
  data: IName[] | undefined;
  colors?: string[];
};

export type TViewMode = "chart" | "status" | "cards";

const getTextWidth = (text: string, font = "bold 13px Nunito") => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return text.length * 8;

  context.font = font;

  return context.measureText(text).width;
};

const ColoredTick = (props: ColoredTickProps) => {
  const { x = 0, y = 0, payload, data, colors } = props;
  if (!data) return;
  const name = payload.value;
  const index = data.findIndex((d) => d.name === name);
  const color = colors?.[index] || "#343C8F";

  const padding = 10;
  const width = getTextWidth(name, "bold 13px Nunito") + padding;

  const xNum = Number(x);
  const yNum = Number(y);

  return (
    <foreignObject x={xNum - width / 2} y={yNum - 8} width={width} height={30}>
      <div
        style={{
          backgroundColor: `${color}60`,
          color,
          fontSize: 13,
          textAlign: "center",
          padding: "4px 0px",
          borderRadius: 9999,
          fontWeight: "bold",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </foreignObject>
  );
};

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const VerticalBarChart = (props: TProps) => {
  const {
    chartData,
    Tooltip,
    colors,
    title,
    smallGapBetweenBars,
    valueOnBar,
    coloredTick,
    showToggle,
    decimal,
    refreshRequest,
    hideYAxis,
    cardSuffix,
    maxBarSize = 0,
    className,
    chartClassName,
    xAxisLabel,
    yAxisLabel,
    maxHeight,
    reduceWidthOnDesktop,
  } = props;

  const { data, error, isLoading } = chartData;
  const { isMd } = useBreakpoint();

  const [viewMode, setViewMode] = useState<TViewMode>("status");
  const [showStatusText, setShowStatusText] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setShowStatusText(false);

    if (error || (isLoading && viewMode === "status")) return;

    if (isLoading) {
      handleToggleView("status");
      const timeout = setTimeout(() => setShowStatusText(true), 500);
      return () => clearTimeout(timeout);
    }

    if (!isLoading && !data?.length) return;

    handleToggleView("chart");
  }, [isLoading]);

  const handleToggleView = (mode: TViewMode) => {
    setShowContent(false);

    setTimeout(() => {
      setViewMode(mode);
    }, 200);

    setTimeout(() => {
      setShowContent(true);
    }, 400);
  };

  const isReady = !isLoading && !error;
  const showChart = viewMode === "chart" && isReady;
  const showCards = viewMode === "cards" && isReady;

  const maxValue =
    data && data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const maxDigits = maxValue
    ? String(Math.floor(Math.abs(maxValue))).length
    : 1;
  const yAxisWidth = 20 + maxDigits * 10;

  const newData = data?.map((item) => ({
    ...item,
    name: item.name.length > 15 ? `${item.name.split(" ")[0]}...` : item.name,
    fullName: item.name,
  }));

  if (!data) return <></>;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <ChartTitle
        title={title}
        showToggle={showToggle && isReady && viewMode !== "status"}
        viewMode={viewMode}
        setViewMode={handleToggleView}
      />

      <AutoHeight
        duration={400}
        height={viewMode === "status" || isLoading || error ? 350 : "100%"}
        contentClassName="auto-content h-full"
        className={cn(
          "!overflow-visible rounded-xl bg-[#F7F4FE] transition-colors duration-500",
          error && "bg-red-100",
          !data?.length && isReady && "bg-orange-100",
        )}
      >
        <div className="h-full px-5 py-6">
          <div
            className={cn(
              "flex h-full items-center justify-center align-middle transition-opacity duration-200",
              (viewMode === "status" || isLoading || error) &&
                "min-h-[350px] rounded-xl bg-white",
              showContent ? "h-full opacity-100" : "opacity-0",
              showChart &&
                "rounded-xl bg-white p-4 shadow-[0_0_24px_0_#3217560F]",
              showCards &&
                "grid h-auto grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3",
            )}
          >
            {showChart && (
              <ResponsiveContainer
                width={
                  reduceWidthOnDesktop && (data?.length || 0) < 5 && isMd
                    ? `${20 * (data?.length || 0)}%`
                    : "100%"
                }
                height={maxHeight || 375}
                maxHeight={maxHeight || undefined}
                minHeight={375}
                className="flex items-end"
              >
                <ChartContainer
                  config={chartConfig}
                  className={cn("col-span-2 h-full w-full", chartClassName)}
                >
                  <BarChart
                    accessibilityLayer
                    data={newData}
                    barCategoryGap={
                      smallGapBetweenBars || (data?.length || 0) <= 5 ? 3 : 10
                    }
                    margin={{
                      top: 25,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    {!hideYAxis && (
                      <CartesianGrid vertical={false} strokeDasharray="30 20" />
                    )}

                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={!xAxisLabel ? 10 : 0}
                      axisLine={!hideYAxis}
                      tick={
                        coloredTick &&
                        ((tickProps) => (
                          <ColoredTick
                            {...tickProps}
                            data={data}
                            colors={colors}
                          />
                        ))
                      }
                      label={
                        Boolean(xAxisLabel) && {
                          value: xAxisLabel,
                          position: "insideBottom",
                          offset: -5,
                        }
                      }
                    />

                    {!hideYAxis && (
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={yAxisWidth + (yAxisLabel ? 10 : 0)}
                        label={
                          Boolean(yAxisLabel) && {
                            value: yAxisLabel,
                            angle: -90,
                            position: "insideLeft",
                            dx: 5,
                            dy: 100,
                          }
                        }
                        radius={8}
                      />
                    )}

                    {valueOnBar && (
                      <LabelList
                        dataKey="value"
                        content={(props) => {
                          const { x, y, width, height, value } = props;

                          const cx = Number(x) + Number(width) / 2;
                          const cy = Number(y) + Number(height) / 2;

                          const isHeightSmall = Number(height) < 22;
                          const ty = isHeightSmall ? Number(y) - 10 : cy;

                          const formattedValue = decimal
                            ? Number(value).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : Number(value).toLocaleString("pt-BR");

                          return (
                            <g>
                              {isHeightSmall && (
                                <rect
                                  x={cx - 18}
                                  y={ty - 12}
                                  width={36}
                                  height={20}
                                  rx={6}
                                  fill="#FFFFFF"
                                />
                              )}

                              <text
                                x={cx}
                                y={ty}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize={14}
                                fontWeight="bold"
                                fill={isHeightSmall ? "#666666" : "#FFFFFF"}
                                stroke={isHeightSmall ? "none" : "#000000"}
                                strokeWidth={isHeightSmall ? 0 : 2}
                                style={{ paintOrder: "stroke" }}
                              >
                                {formattedValue}
                              </text>
                            </g>
                          );
                        }}
                      />
                    )}

                    <ChartTooltip
                      cursor={{ fillOpacity: 0.7 }}
                      content={
                        Tooltip ? (
                          Tooltip
                        ) : (
                          <ChartTooltipContent
                            hideIndicator={!colors?.length}
                          />
                        )
                      }
                      allowEscapeViewBox={{ y: true }}
                    />

                    <Bar
                      dataKey="value"
                      maxBarSize={
                        maxBarSize !== 0
                          ? maxBarSize
                          : data.length <= 5
                            ? 45
                            : undefined
                      }
                    >
                      {data?.map((_, index) => {
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              colors?.length
                                ? colors[index]
                                : "hsl(var(--primary))"
                            }
                            radius={8}
                          />
                        );
                      })}

                      {valueOnBar && (
                        <LabelList
                          dataKey="value"
                          position="centerTop"
                          content={(props) => {
                            const { x, y, value, width, height } = props;

                            const formattedValue = decimal
                              ? Number(value).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : value;

                            const isNegative = Number(value) < 0;
                            const labelY = isNegative
                              ? Number(y) + Number(height) - 10
                              : Number(y) - 10;

                            return (
                              <g>
                                <text
                                  x={Number(x) + Number(width) / 2}
                                  y={labelY}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize={14}
                                  fontWeight="bold"
                                  alignmentBaseline="middle"
                                  stroke="#fff"
                                  strokeWidth={4}
                                  paintOrder="stroke"
                                  style={{ paintOrder: "stroke" }}
                                >
                                  {formattedValue}
                                </text>

                                <text
                                  x={Number(x) + Number(width) / 2}
                                  y={labelY}
                                  textAnchor="middle"
                                  fill={isNegative ? "#df4242" : "#666666"}
                                  fontSize={14}
                                  fontWeight="bold"
                                  alignmentBaseline="middle"
                                >
                                  {formattedValue}
                                </text>
                              </g>
                            );
                          }}
                        />
                      )}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </ResponsiveContainer>
            )}

            {viewMode === "cards" &&
              data?.map((item, index) => (
                <div key={index} className="gap-2 rounded-lg bg-white p-4">
                  <p className="mb-2 flex items-center gap-2 font-bold">
                    {colors?.length && (
                      <span
                        className="block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            colors[index] || "hsl(var(--primary))",
                        }}
                      />
                    )}{" "}
                    {item.name}
                  </p>
                  <p className="text-[#7E6B8C]">
                    Total:{" "}
                    <span className="font-bold text-black">
                      {item.value} {cardSuffix}
                    </span>
                  </p>
                </div>
              ))}

            {viewMode === "status" && (
              <StatusPlaceholder
                error={error}
                hasData={Boolean(data.length)}
                refreshRequest={refreshRequest}
                showContent={showContent}
                isLoading={isLoading}
                showStatusText={showStatusText}
                setShowStatusText={setShowStatusText}
              />
            )}
          </div>
        </div>
      </AutoHeight>
    </div>
  );
};

export default VerticalBarChart;
