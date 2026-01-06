import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type TValue = {
  text: string;
  value: number;
};

type TDropdownButton = {
  label: string;
  options: TValue[];
  onChangeValue?: () => void;
  onSelect?: (value: TValue) => void;
};

export const DropdownButton = ({
  label,
  options = [],
  onSelect,
}: TDropdownButton) => {
  const ref = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize(entry.contentRect.width);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={ref}
        className="border border-slate-200 rounded hover:bg-slate-100 hover:cursor-pointer"
      >
        {label}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ minWidth: `${size}px` }}
        className={cn("bg-white border border-slate-200 hover:cursor-pointer")}
      >
        {options.map((opt, idx) => (
          <DropdownMenuItem
            key={idx}
            className="hover:bg-slate-100 hover:cursor-pointer"
            onSelect={() => onSelect?.(opt)}
          >
            {opt.text}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
