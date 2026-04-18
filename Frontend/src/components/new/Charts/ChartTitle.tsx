import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChartBig, LayoutGrid } from "lucide-react";
import type { TViewMode } from "./VerticalChart";

type TChartTitleProps = {
  title: string;
  showToggle?: boolean;
  viewMode?: string;
  setViewMode?: (value: TViewMode) => void;
};

const ChartTitle = (props: TChartTitleProps) => (
  <div className="mb-2 flex flex-row justify-between align-middle">
    <h1 className="mb-2 self-end text-xl font-bold">{props.title}</h1>

    <ToggleGroup
      type="single"
      variant="outline"
      size="lg"
      value={props.viewMode}
      onValueChange={(value: TViewMode) => {
        if (value) props.setViewMode?.(value);
      }}
      className={
        props.showToggle
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }
    >
      <ToggleGroupItem
        value="chart"
        aria-label="Alternar para visualização de gráfico"
        className="border-gray-300 data-[state=on]:bg-gray-300"
      >
        <BarChartBig className="scale-125" />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="cards"
        aria-label="Alternar para visualização de cards"
        className="border-gray-300 data-[state=on]:bg-gray-300"
      >
        <LayoutGrid className="scale-125" />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
);

export default ChartTitle;
