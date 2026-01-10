import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { InputForm } from "@/components/new/InputForm";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import PaymentSummary from "./PaymentSummary";

type Props = {
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
  onSubmit: () => void;
};

export default function PaymentStep({ canOpenStep, form, onSubmit }: Props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const selectedMethod = watch("pagamento");

  useEffect(() => {
    if (selectedMethod !== "cartao") {
      setValue("numero_cartao", "", { shouldValidate: true });
      setValue("nome_titular", "", { shouldValidate: true });
      setValue("validade", "", { shouldValidate: true });
      setValue("cvv", "", { shouldValidate: true });
      setValue("parcelas", "1", { shouldValidate: true });
    }
  }, [selectedMethod, setValue]);

  const isStepValid = () => {
    if (!selectedMethod) return false;

    if (selectedMethod === "cartao") {
      const cardFields = [
        "numero_cartao",
        "nome_titular",
        "validade",
        "cvv",
        "parcelas",
      ];
      return cardFields.every((field) => !errors[field as keyof TForm]);
    }

    return true;
  };

  const getButtonLabel = () => {
    switch (selectedMethod) {
      case "pix":
        return "Gerar Pix";
      case "boleto":
        return "Gerar Boleto";
      case "cartao":
        return "Finalizar Compra";
      default:
        return "Selecione uma forma de pagamento";
    }
  };

  return (
    <AccordionItem value="pagamento">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("pagamento")) {
            e.preventDefault();
          }
        }}
      >
        Forma de Pagamento
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
        <RadioGroup
          value={selectedMethod ?? ""}
          onValueChange={(value) =>
            setValue("pagamento", value as "pix" | "cartao" | "boleto", {
              shouldValidate: true,
            })
          }
          className="space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                selectedMethod === "pix"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <RadioGroupItem value="pix" className="sr-only" />
              <div className="text-4xl mb-3">📱</div>
              <div className="font-semibold text-lg">Pix</div>
              <p className="text-sm text-gray-600 mt-1">
                À vista - pagamento instantâneo
              </p>
            </label>

            <label
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                selectedMethod === "cartao"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <RadioGroupItem value="cartao" className="sr-only" />
              <div className="text-4xl mb-3">💳</div>
              <div className="font-semibold text-lg">Cartão de Crédito</div>
              <p className="text-sm text-gray-600 mt-1">Até 12x sem juros</p>
            </label>

            <label
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                selectedMethod === "boleto"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60"
              )}
            >
              <RadioGroupItem value="boleto" className="sr-only" />
              <div className="text-4xl mb-3">📄</div>
              <div className="font-semibold text-lg">Boleto</div>
              <p className="text-sm text-gray-600 mt-1">
                À vista - compensação em 1-3 dias
              </p>
            </label>
          </div>
        </RadioGroup>

        {selectedMethod === "cartao" && (
          <div className="mt-6 space-y-5 bg-gray-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                name="numero_cartao"
                control={control}
                label="Número do Cartão"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              <InputForm
                name="nome_titular"
                control={control}
                label="Nome do Titular"
                placeholder="Como está no cartão"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InputForm
                name="validade"
                control={control}
                label="Validade"
                placeholder="MM/AA"
                maxLength={5}
              />
              <InputForm
                name="cvv"
                control={control}
                label="CVV"
                placeholder="123"
                maxLength={4}
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Parcelamento
              </label>
              <select
                className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={watch("parcelas") ?? "1"}
                onChange={(e) => setValue("parcelas", e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x de R$ {(100).toFixed(2)}
                    {n > 1 ? " sem juros" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center text-lg font-medium mb-6">
            <span>Total a pagar:</span>
            <span className="text-green-700 text-2xl">R$ {"0,00"}</span>
          </div>

          <NewButton
            label={getButtonLabel()}
            icon={<CircleArrowRight />}
            onClick={onSubmit}
            disabled={!isStepValid()}
            className={cn(
              "w-full py-7 text-lg",
              isStepValid()
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            )}
          />
        </div>

        <PaymentSummary
          form={form}
          onSubmit={onSubmit}
          total={150}
          isSubmitting={isSubmitting}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
