import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type React from "react";
import { cn } from "@/lib/utils";

type TTextAreaForm = {
  required?: boolean;
  label?: string;
  restrictInput?: RegExp;
  onChangeValue?: (value: string) => void;
  isSkeletonLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  background?: "light" | "dark";
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  rows?: number;
};

const TextAreaForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  label,
  control,
  name,
  required,
  onChangeValue,
  placeholder = "Digite ...",
  restrictInput,
  onBlur,
  maxLength,
  isSkeletonLoading,
  background = "light",
  disabled,
  rows = 4,
}: TTextAreaForm & UseControllerProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {isSkeletonLoading ? (
            <>
              <Skeleton className="h-[23px] w-1/2 max-w-full" />
              <Skeleton className="h-[90px] w-full max-w-full" />
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
                <Textarea
                  {...field}
                  rows={rows}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  disabled={disabled}
                  className={cn(
                    background === "dark" && "bg-transparent text-white",
                    "h-5",
                  )}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (restrictInput)
                      event.target.value = event.target.value.replace(
                        restrictInput,
                        "",
                      );

                    field.onChange(event);
                    onChangeValue?.(event.target.value);
                  }}
                  onBlur={onBlur}
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

TextAreaForm.displayName = "TextAreaForm";

export { TextAreaForm };
