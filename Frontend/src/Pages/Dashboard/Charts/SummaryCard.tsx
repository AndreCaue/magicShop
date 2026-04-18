import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SummaryItem {
  label: string;
  value: string | number;
  highlight?: "amber" | "emerald" | "red";
}

interface SummaryCardProps {
  title?: string;
  items: SummaryItem[];
}

const highlightColors = {
  amber: "text-amber-500",
  emerald: "text-emerald-500",
  red: "text-red-500",
};

export function SummaryCard({
  title = "Resumo Geral",
  items,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-8"
    >
      <Card className="bg-zinc-900 border-zinc-800 text-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {items.map((item, i) => (
              <div key={i}>
                {item.label}:{" "}
                <strong
                  className={
                    item.highlight ? highlightColors[item.highlight] : undefined
                  }
                >
                  {typeof item.value === "number"
                    ? item.value.toLocaleString("pt-BR")
                    : item.value}
                </strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
