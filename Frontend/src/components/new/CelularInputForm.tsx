import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { useMaskito } from "@maskito/react";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type React from "react";
import { cn } from "@/lib/utils";

type TCelularInputForm = {
  required?: boolean;
  label?: string;
  onChangeValue?: (value: string) => void;
  isSkeletonLoading?: boolean;
  placeholder?: string;
  iconPlaceholder?: React.ReactElement;
  background?: "light" | "dark";
  className?: string;
};

const celularOnlyMaskOptions = {
  mask: [
    "(",
    /\d/,
    /\d/,
    ")",
    " ",
    /[6-9]/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
};

const CelularInputForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  label,
  control,
  name,
  required,
  iconPlaceholder,
  onChangeValue,
  placeholder = "(99) 99999-9999",
  isSkeletonLoading,
  background = "light",
}: TCelularInputForm & UseControllerProps<TFieldValues, TName>) => {
  const maskitoRef = useMaskito({ options: celularOnlyMaskOptions });

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {isSkeletonLoading ? (
            <>
              <Skeleton className="h-[23px] w-1/2 max-w-full" />
              <Skeleton className="h-[40px] w-full max-w-full lg:h-[42px]" />
            </>
          ) : (
            <>
              <FormLabel
                className={cn(
                  background === "light" ? "text-black" : "text-white"
                )}
              >
                {label || "Celular"}
                {required && <span className="text-red-500">*</span>}
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  ref={maskitoRef}
                  placeholder={placeholder}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(e.target.value);
                    onChangeValue?.(e.target.value);
                  }}
                  background={background}
                  icon={iconPlaceholder}
                  type="tel"
                />
              </FormControl>
              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};

CelularInputForm.displayName = "CelularInputForm";

export { CelularInputForm };
