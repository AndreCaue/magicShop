import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";

type Props = { form: UseFormReturn<TForm> };

export default function PaymentMethodSelector({ form }: Props) {
  const { watch, setValue } = form;

  return (
    <RadioGroup
      value={watch("pagamento") ?? ""}
      onValueChange={(value) =>
        setValue("pagamento", value as any, { shouldValidate: true })
      }
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className={cn("...")}>
          <RadioGroupItem value="pix" className="sr-only" />
        </label>
        <label className={cn("...")}>
          <RadioGroupItem value="cartao" className="sr-only" />
        </label>
        <label className={cn("...")}>
          <RadioGroupItem value="boleto" className="sr-only" />
        </label>
      </div>
    </RadioGroup>
  );
}
