import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type React from "react";
import { cn } from "@/lib/utils";
import { useMaskito } from "@maskito/react";
import type { MaskitoOptions } from "@maskito/core";

type TCpfInputForm = {
  required?: boolean;
  label?: string;
  onChangeValue?: (value: string) => void;
  isSkeletonLoading?: boolean;
  placeholder?: string;
  iconPlaceholder?: React.ReactElement;
  background?: "light" | "dark";
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
};

const cpfMask: MaskitoOptions = {
  mask: [
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
  ],
};

const CPFInputForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  label = "CPF",
  control,
  name,
  required,
  iconPlaceholder,
  onChangeValue,
  placeholder = "000.000.000-00",
  onBlur,
  isSkeletonLoading,
  background = "light",
  disabled,
}: TCpfInputForm & UseControllerProps<TFieldValues, TName>) => {
  const maskedInputRef = useMaskito({ options: cpfMask });

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
                  background === "light"
                    ? "text-black placeholder:text-black"
                    : "text-white placeholder:text-white",
                )}
              >
                <>
                  {label}
                  {required && <span className="text-red-500">*</span>}
                </>
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  ref={maskedInputRef}
                  placeholder={placeholder}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    field.onChange(event);
                    onChangeValue?.(event.target.value);
                  }}
                  onBlur={onBlur}
                  background={background}
                  type="text"
                  icon={iconPlaceholder}
                  disabled={disabled}
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

CPFInputForm.displayName = "CPFInputForm";

export { CPFInputForm };
