import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "./subComponentes/Spinner";

type TCounterButton = {
  onClick?: () => void;
  label: string;
  className?: string;
  isSkeletonLoading?: boolean;
  disabled?: boolean;
  counting?: number;
  icon?: ReactNode;
};

export const CounterButton = ({
  onClick,
  label,
  className,
  isSkeletonLoading,
  icon,
  counting,
  disabled,
  ...props
}: TCounterButton) => {
  const isCounting = typeof counting === "number" && counting > 0;

  if (isSkeletonLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isCounting}
      className={cn(
        "w-full h-full bg-white border border-slate-200 text-black text-base font-normal transition-all",
        isCounting
          ? "cursor-not-allowed opacity-80"
          : "hover:bg-slate-100 lg:hover:scale-105",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isCounting ? (
          <motion.div
            key="counting"
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Contador com pulso */}
            <motion.span
              className="font-medium tabular-nums"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {counting}s
            </motion.span>

            <Spinner />
          </motion.div>
        ) : (
          <motion.div
            key="default"
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {icon}
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
};
