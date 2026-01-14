import { type TValue } from "@/components/new/DropdownButton";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { User2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TUserTopbar = {
  label: string;
  options: TValue[];
  userEmail: string;
  onChangeValue?: () => void;
  onSelect?: (value: TValue) => void;
};

export const UserTopbar = ({ options, onSelect, userEmail }: TUserTopbar) => {
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
      <span className="hidden lg:flex lg:flex-col lg:text-center text-sm text-gray-600">
        Seja Bem Vindo!
        <span className="truncate w-12 mx-auto">{userEmail}</span>
      </span>
      <DropdownMenuTrigger
        ref={ref}
        className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:scale-95"
      >
        <User2 className="w-5 h-5 text-gray-700 " />
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
