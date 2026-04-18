import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, CreditCard, Package, Users } from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ICONS = {
  "map-pin": MapPin,
  "credit-card": CreditCard,
  package: Package,
  users: Users,
} as const;

type IconKey = keyof typeof ICONS;

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: IconKey;
  colSpan?: 1 | 2;
  height?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  icon,
  colSpan,
  height = "h-80",
  children,
}: ChartCardProps) {
  const Icon = icon ? ICONS[icon] : null;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={colSpan === 2 ? "lg:col-span-2" : undefined}
    >
      <Card className="bg-zinc-900 border-zinc-800 h-full text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={height}>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
