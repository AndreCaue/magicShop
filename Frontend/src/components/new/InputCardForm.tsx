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

type TInputCardForm = {
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

const cardMaskOptions = {
  mask: [
    ...Array(4).fill(/\d/),
    " ",
    ...Array(4).fill(/\d/),
    " ",
    ...Array(4).fill(/\d/),
    " ",
    ...Array(4).fill(/\d/),
  ],
};

const InputCardForm = <
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
  placeholder = "0000 0000 0000 0000",
  isSkeletonLoading,
  onBlur,
  background = "light",
  disabled,
}: TInputCardForm & UseControllerProps<TFieldValues, TName>) => {
  const maskedInputRef = useMaskito({ options: cardMaskOptions });

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
                    const unmaskedValue = event.target.value.replace(/\s/g, "");
                    onChangeValue?.(unmaskedValue);
                  }}
                  background={background}
                  onBlur={onBlur}
                  maxLength={19} // 16 dígitos + 3 espaços
                  type="text"
                  icon={iconPlaceholder}
                  disabled={disabled}
                  inputMode="numeric"
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

InputCardForm.displayName = "InputCardForm";

export { InputCardForm };
