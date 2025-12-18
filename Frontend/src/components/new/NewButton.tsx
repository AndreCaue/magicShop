import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

type TNewButton = {
  onClick?: () => void;
  label: string;
  className?: string;
  isSkeletonLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export const NewButton = ({
  onClick,
  label,
  className,
  isSkeletonLoading,
  icon,
  disabled,
  ...props
}: TNewButton) => {
  return (
    <>
      {isSkeletonLoading ? (
        <>
          <Skeleton className="w-full h-full" />
        </>
      ) : (
        <Button
          onClick={onClick}
          className={cn(
            "w-full h-full bg-white hover:bg-slate-100 text-black hover:cursor-pointer border border-slate-200 text-base font-normal lg:hover:scale-105",
            className
          )}
          {...props}
          disabled={disabled}
        >
          {icon}
          {label}
        </Button>
      )}
    </>
  );
};
