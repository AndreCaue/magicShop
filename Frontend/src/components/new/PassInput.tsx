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
import { useState } from "react";

type TInputForm = {
  required?: boolean;
  label?: string;
  restrictInput?: RegExp;
  onChangeValue?: (value: string) => void;
  isSkeletonLoading?: boolean;
  placeholder?: string;
  background?: "dark" | "light";
  iconPlaceholder?: React.ReactElement;
  className?: string;
  type?: string;
};

const PassInput = <
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
  placeholder = "Digite ...",
  restrictInput,
  isSkeletonLoading,
  ...props
}: TInputForm & UseControllerProps<TFieldValues, TName>) => {
  const [showPassword, setShowPassword] = useState(false);

  const onClickEye = () => {
    setShowPassword((prev) => !prev);
  };
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
              <FormLabel className="text-white">
                {label}
                {required && <span className="text-red">*</span>}
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (restrictInput)
                      event.target.value = event.target.value.replace(
                        restrictInput,
                        ""
                      );
                    field.onChange(event);
                    onChangeValue?.(event.target.value);
                  }}
                  typeInput="inputpass"
                  icon={iconPlaceholder}
                  onClick={onClickEye}
                  toggleEye={showPassword}
                  {...props}
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

PassInput.displayName = "PassInput";

export { PassInput };
