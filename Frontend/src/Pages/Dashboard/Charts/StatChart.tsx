import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  badge?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-zinc-400",
  trend,
  badge,
  subtitle,
}: StatCardProps) {
  return (
    <motion.div variants={cardVariants} className="h-full">
      <Card className="bg-zinc-900 border-zinc-50 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-100">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <div className="text-3xl font-bold text-zinc-400">{value}</div>
          <div className="mt-1 h-6 flex items-center">
            {trend && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {trend}
              </p>
            )}
            {badge && <Badge variant="secondary">{badge}</Badge>}
            {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
