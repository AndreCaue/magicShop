import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";

import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  label?: string;
  placeholder?: string;
  onSearch?: (value: string) => void; // obrigatório agora
  debounceMs?: number;
  minChars?: number; // evita busca com 1 letra
  background?: "light" | "dark";
  className?: string;
  disabled?: boolean;
  isSkeletonLoading?: boolean;
};

const SearchInput2 = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = "Em desenvolvimento...",
  onSearch,
  debounceMs = 500,
  minChars = 2,
  background = "light",
  className,
  disabled,
  isSkeletonLoading,
}: SearchInputProps & UseControllerProps<TFieldValues, TName>) => {
  const value = control?._formValues?.[name] ?? "";
  const [debouncedValue] = useDebounce(value, debounceMs);

  useEffect(() => {
    if (debouncedValue.length >= minChars || debouncedValue === "") {
      onSearch?.(debouncedValue.trim());
    }
  }, [debouncedValue, onSearch, minChars]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5 min-w-3xl", className)}>
          {isSkeletonLoading ? (
            <>
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              {label && (
                <FormLabel
                  className={
                    background === "dark" ? "text-white" : "text-foreground"
                  }
                >
                  {label}
                </FormLabel>
              )}

              <FormControl>
                <div className="relative">
                  <Search
                    className={cn(
                      "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                      background === "dark"
                        ? "text-gray-400"
                        : "text-muted-foreground"
                    )}
                  />
                  <Input
                    {...field}
                    placeholder={placeholder}
                    className="pl-9"
                    background={background}
                    disabled={disabled}
                    type="search"
                  />
                </div>
              </FormControl>

              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};

SearchInput2.displayName = "SearchInput2";

export { SearchInput2 };
