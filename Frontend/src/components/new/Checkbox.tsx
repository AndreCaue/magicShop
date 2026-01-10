import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import type { TOptionsSelectForm } from "./DropdownForm";
import type {
  CheckboxIndicatorProps,
  CheckedState,
} from "@radix-ui/react-checkbox";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

type TCheckbox = CheckboxIndicatorProps & {
  label?: string;
  required?: boolean;
  options: TOptionsSelectForm[];
  multiple?: boolean;
  className?: string;
  isSkeletonLoading?: boolean;
};

type CustomCheckboxProps = {
  checked: boolean;
};

const CustomCheckbox = ({ checked }: CustomCheckboxProps) => {
  return (
    <div
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded border transition-all duration-200",
        checked
          ? "border-black bg-white text-red-500"
          : "border-gray-400 bg-white"
      )}
    >
      {checked && <span className="text-sm font-bold leading-none">♦</span>}
    </div>
  );
};

const CheckboxForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  options,
  multiple,
  className,
  name,
  control,
  isSkeletonLoading,
  ...props
}: TCheckbox & UseControllerProps<TFieldValues, TName>) => {
  const handleCheckboxChange = (
    field: ControllerRenderProps<TFieldValues, TName>,
    checked: CheckedState,
    item: TOptionsSelectForm
  ) => {
    if (!multiple) {
      return checked ? field.onChange(item.value) : field.onChange(null);
    }

    if (!checked) {
      return field.onChange(
        field.value?.filter((value: any) => value !== item.value)
      );
    }

    if (!field.value) {
      return field.onChange([item.value]);
    }

    field.onChange([...field.value, item.value]);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-col",
            isSkeletonLoading && "space-y-2.5",
            className
          )}
        >
          {isSkeletonLoading ? (
            <>
              {label && <Skeleton className="h-[23px] w-1/2" />}
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
            </>
          ) : (
            <>
              {label && <FormLabel>{label}</FormLabel>}

              <div className="flex flex-wrap gap-4">
                {options.map((option) => {
                  const checked = multiple
                    ? field.value?.includes(option.value)
                    : field.value === option.value;

                  return (
                    <FormItem
                      key={option.value}
                      className="flex items-center space-y-0"
                    >
                      <FormControl>
                        <label className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            {...props}
                            className="sr-only"
                            checked={checked}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(field, checked, option)
                            }
                          />

                          <CustomCheckbox checked={checked} />

                          <span className="select-none text-sm">
                            {option.text}
                          </span>
                        </label>
                      </FormControl>
                    </FormItem>
                  );
                })}
              </div>

              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};

export { CheckboxForm };
