import { Check, CircleHelp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type {
  FieldPath,
  FieldValues,
  UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import Popup from "./Popup";
import { InputRightIcons } from "../utils/InputRightIcons";
import { isTruthyOrZero } from "@/helpers/generics";

export type TOptionsSelectForm = {
  text: string;
  value: number;
  searchValue?: string;
};

type TSelectForm = {
  maxLength?: number;
  onChangeValue?: (value: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  options: TOptionsSelectForm[];
  className?: string;
  autoSetUnique?: boolean;
  testId?: string;
  tooltip?: string | React.JSX.Element;
  isSkeletonLoading?: boolean;
  inputClass?: string;
  placeholder?: string;
  ariaLabel?: string;
  searchAriaLabel?: string;
  filter?: (value: string, search: string) => number;
};

const DropdownForm = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  options,
  ...props
}: TSelectForm & UseControllerProps<TFieldValues, TName>) => {
  return (
    <FormField
      control={control}
      key={name}
      name={name}
      render={({ field }) => (
        <InternalSelectForm field={field} options={options} {...props} />
      )}
    />
  );
};

type TInternalSelectForm = {
  field: FieldValues;
} & TSelectForm;

const InternalSelectForm: React.FC<TInternalSelectForm> = ({
  field,
  options,
  testId = "selectForm",
  tooltip,
  isSkeletonLoading,
  inputClass,
  placeholder = "Selecione...",
  ariaLabel,
  searchAriaLabel = "Digite para filtrar os itens da lista",
  ...props
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [popoverResizeWidth, setPopoverResizeWidth] = useState("");
  const internalRef = useRef<HTMLButtonElement>(null);
  const [screenReaderMessage, setScreenReaderMessage] = useState("");

  const isFetching = options === null;

  const handleOpenChange = (open: boolean) => {
    if (props.disabled || isFetching) return;
    setIsMenuOpen(open);
  };

  const handleClear = () => {
    field.onChange?.(null);
    // @ts-expect-error it should receive null as value to clear
    props.onChangeValue?.(null);
  };

  const handleSelect = (value: number, text?: string, isAuto = false) => {
    field.onChange(value);

    if (isAuto && props.onChangeValue) {
      props.onChangeValue(value);
    }

    if (!isAuto) {
      props.onChangeValue?.(value);
    }

    setIsMenuOpen(false);
    setScreenReaderMessage(`Item selecionado: ${text}`);
  };

  useEffect(() => {
    const updatePopoverResize = () => {
      if (internalRef.current) {
        setPopoverResizeWidth(`${internalRef.current.offsetWidth}px`);
      }
    };
    updatePopoverResize();

    const handleResize = () => updatePopoverResize();
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(updatePopoverResize);
    if (internalRef.current) observer.observe(internalRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (internalRef.current) observer.unobserve(internalRef.current);
    };
  }, [options]);

  return (
    <FormItem className={props.className}>
      {isSkeletonLoading ? (
        <>
          <Skeleton className="h-[23px] w-1/2 max-w-full" />
          <Skeleton className="h-[40px] w-full max-w-full lg:h-[42px]" />
        </>
      ) : (
        <>
          <FormLabel>
            {props.label}
            {"\n"}
            {tooltip && (
              <Popup
                content={tooltip}
                trigger={
                  <CircleHelp className="size-5 cursor-pointer text-primary ring-0" />
                }
              />
            )}
            {props.required && <p className="text-red-500">*</p>}
          </FormLabel>

          <div
            className={cn(
              "my-3 flex w-full flex-row items-start justify-between rounded border sm:items-center",
              inputClass,
              (props.disabled || isFetching) &&
                "cursor-not-allowed bg-slate-200 opacity-50"
            )}
          >
            <Popover
              open={isMenuOpen}
              onOpenChange={handleOpenChange}
              modal={true}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    data-testid={testId}
                    ref={(e) => {
                      field.ref(e);
                      internalRef.current = e;
                    }}
                    disabled={props.disabled || isFetching}
                    onBlur={field.onBlur}
                    variant="outline"
                    role="combobox"
                    className="flex min-h-10 w-full flex-row hover:text-white placeholder:text-white justify-between whitespace-normal text-wrap break-words border-none bg-transparent px-3 py-2.5 text-left ring-2 ring-transparent hover:bg-transparent hover:ring-gray-400 focus-visible:ring-offset-0"
                    aria-labelledby={ariaLabel && "button-aria-label"}
                  >
                    {field.value !== null && field.value !== undefined ? (
                      <span>
                        {options?.find((opt) => opt.value === field.value)
                          ?.text ?? placeholder}
                      </span>
                    ) : (
                      <span
                        className="text-slate-500"
                        aria-hidden={Boolean(ariaLabel)}
                      >
                        {placeholder}
                      </span>
                    )}

                    <InputRightIcons
                      isMenuOpen={isMenuOpen}
                      showClearIcon={isTruthyOrZero(field.value)}
                      handleClear={handleClear}
                      isLoading={isFetching}
                    />
                  </Button>
                </FormControl>
              </PopoverTrigger>

              {Boolean(ariaLabel) && (
                <span id="button-aria-label" className="sr-only">
                  {ariaLabel}
                </span>
              )}

              <PopoverContent
                className="group max-w-full p-0"
                style={{ width: popoverResizeWidth }}
                data-testid="triggerDropdown"
              >
                <Command filter={props.filter}>
                  <CommandInput
                    placeholder="Pesquisar"
                    data-testid="searchCommandInputBottom"
                    autoFocus
                    aria-label={searchAriaLabel}
                    role="search"
                  />

                  <CommandList className="max-h-[150px] h-sm:max-h-[200px] h-md:max-h-[300px]">
                    <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>

                    <CommandGroup>
                      {options?.map((option) => (
                        <CommandItem
                          value={
                            option.searchValue
                              ? option.text + option.searchValue
                              : option.text
                          }
                          key={option.value}
                          onSelect={() =>
                            handleSelect(option.value, option.text)
                          }
                          className="py-2 text-lg"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              option.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.text}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
          <div aria-live="polite" className="sr-only">
            {screenReaderMessage}
          </div>
        </>
      )}
    </FormItem>
  );
};

export { DropdownForm };
