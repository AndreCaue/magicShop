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

type TCustomValue = TValue & {
  disabled?: boolean;
};

type TUserTopbar = {
  label: string;
  options: TCustomValue[];
  userEmail: string;
  onChangeValue?: () => void;
  onSelect?: (value: TValue) => void;
  className?: string;
};

export const UserTopbar = ({
  options,
  onSelect,
  userEmail,
  className,
}: TUserTopbar) => {
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
    <div className="hidden lg:flex">
      <DropdownMenu>
        <span className="hidden lg:flex lg:flex-col lg:text-center text-sm text-gray-600 mr-10 -ml-15">
          Seja Bem Vindo!
          <span className="truncate w-12 mx-auto">{userEmail}</span>
        </span>
        <DropdownMenuTrigger
          ref={ref}
          className={cn(
            "relative p-2 rounded-lg  cursor-pointer transition-colors active:scale-95",
            className
          )}
        >
          <User2 className="w-5 h-5 text-gray-700 " />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          style={{ minWidth: `${size}px` }}
          className={cn("bg-white my-1 border-2 border-black  grid gap-2")}
        >
          {options.map((opt, idx) => (
            <DropdownMenuItem
              key={idx}
              className="hover:bg-black hover:text-white hover:disabled:cursor-none hover:cursor-pointer border border-black flex justify-center"
              onSelect={() => onSelect?.(opt)}
              disabled={opt?.disabled}
            >
              {opt.text}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
