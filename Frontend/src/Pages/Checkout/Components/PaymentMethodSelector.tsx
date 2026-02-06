import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { RadioGroup } from "@radix-ui/react-radio-group";
import type { UseFormReturn } from "react-hook-form";
import type { TForm } from "../types";

type TPaymentMethodSelector = {
  selectedMethod: "cartao" | "pix" | "pagamento" | undefined;
  form: UseFormReturn<TForm>;
};

export const PaymentMethodSelector = ({
  selectedMethod,
  form,
}: TPaymentMethodSelector) => {
  const { setValue } = form;
  return (
    <RadioGroup
      value={selectedMethod ?? ""}
      onValueChange={(value) =>
        setValue("pagamento", value as "pix" | "cartao", {
          shouldValidate: true,
        })
      }
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {" "}
        {/* Pix */}
        <label
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer ...",
            selectedMethod === "pix" && "border-green-500 bg-green-50",
          )}
        >
          <RadioGroupItem value="pix" className="sr-only" />
          <div className="text-4xl mb-3">📱</div>
          <div className="font-semibold text-lg">Pix</div>
          <p className="text-sm text-gray-600 mt-1">
            À vista - pagamento instantâneo
          </p>
        </label>
        {/* Cartão */}
        <label
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer ...",
            selectedMethod === "cartao" && "border-green-500 bg-green-50",
          )}
        >
          <RadioGroupItem value="cartao" className="sr-only" />
          <div className="text-4xl mb-3">💳</div>
          <div className="font-semibold text-lg">Cartão de Crédito</div>
          <p className="text-sm text-gray-600 mt-1">Até 12x sem juros</p>
        </label>
      </div>
    </RadioGroup>
  );
};
