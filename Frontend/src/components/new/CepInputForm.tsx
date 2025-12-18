// components/new/CepInputForm.tsx
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useMaskito } from "@maskito/react";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type React from "react";
import { cn } from "@/lib/utils";

type TCepInputForm = {
  required?: boolean;
  label?: string;
  placeholder?: string;
  isSkeletonLoading?: boolean;
  background?: "light" | "dark";
  className?: string;
  /** Função chamada toda vez que o valor do campo muda (com máscara aplicada) */
  onChangeValue?: (value: string) => void;
  iconPlaceholder?: React.ReactElement;
};

const cepMaskOptions = {
  mask: [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/],
};

const CepInputForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  className,
  label = "CEP",
  control,
  name = "cep" as TName,
  required,
  placeholder = "00000-000",
  isSkeletonLoading,
  background = "light",
  onChangeValue,
  iconPlaceholder,
}: TCepInputForm & UseControllerProps<TFieldValues, TName>) => {
  const maskitoRef = useMaskito({ options: cepMaskOptions });

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
                {label}
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
                  type="text"
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

CepInputForm.displayName = "CepInputForm";

export { CepInputForm };
