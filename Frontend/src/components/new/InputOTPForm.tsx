import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Heart } from "lucide-react";

type TInputOTPForm = {
  required?: boolean;
  label?: string;
  restrictInput?: RegExp;
  onChangeValue?: (value: string) => void;
  isSkeletonLoading?: boolean;
  placeholder?: string;
  iconPlaceholder?: React.ReactElement;
  maxLength?: number;
  className?: string;
  type?: string;
};

const InputOTPForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  label,
  control,
  name,
  required,
  isSkeletonLoading,
  ...props
}: TInputOTPForm & UseControllerProps<TFieldValues, TName>) => {
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
              <FormLabel className="text-white flex justify-center">
                {label}
                {required && <span className="text-red">*</span>}
              </FormLabel>

              <FormControl>
                <InputOTP maxLength={6} {...field} {...props}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <Heart className="text-white fill-red-600" />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {/* <InputOTP
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
                  maxLength={maxLength}
                /> */}
              </FormControl>
              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};

InputOTPForm.displayName = "InputOTPForm";

export { InputOTPForm };
