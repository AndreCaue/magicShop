import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { useShippingStore } from "@/stores/useShippingStore";

type Props = {
  goToNextStep: (current: TStep, next: TStep) => Promise<void>;
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
};

export default function ShippingStep({
  goToNextStep,
  canOpenStep,
  form,
}: Props) {
  const {
    shippingOptions,
    isFreeShipping,
    isCalculatingShipping,
    shippingError,
  } = useShippingStore();

  const { watch, setValue } = form;

  const isStepValid = () => {
    if (isFreeShipping) return true;
    return (
      !isCalculatingShipping &&
      shippingOptions.length > 0 &&
      !!watch("frete_opcao")
    );
  };

  const handleNext = async () => {
    await goToNextStep("entrega", "pagamento");
  };

  return (
    <AccordionItem value="entrega">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("entrega")) {
            e.preventDefault();
          }
        }}
      >
        Método de Entrega
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
        {/* Mensagem de frete grátis */}
        {isFreeShipping ? (
          <div className="p-6 bg-green-50 border border-green-300 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-800">
              Frete Grátis! 🎉
            </p>
            <p className="text-green-700 mt-2">
              Sua compra acima de R$250 ganhou entrega gratuita
            </p>
          </div>
        ) : isCalculatingShipping ? (
          /* Loading */
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
            <p className="mt-4 text-gray-600">
              Calculando opções de entrega...
            </p>
          </div>
        ) : shippingOptions.length > 0 ? (
          /* Lista de opções de frete */
          <RadioGroup
            value={watch("frete_opcao") ?? ""}
            onValueChange={(value) => {
              setValue("frete_opcao", value, { shouldValidate: true });
              const selected = shippingOptions.find((opt) => opt.id === value);
              if (selected) {
                // Opcional: atualizar store se necessário
                // setSelectedShipping(selected);
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                    watch("frete_opcao") === option.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={option.id} />
                    <div>
                      <p className="font-medium">
                        {option.nome} - {option.empresa}
                      </p>
                      <p className="text-sm text-gray-600">
                        Entrega em até {option.prazo_dias} dias úteis
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">
                    {option.preco === 0
                      ? "Grátis"
                      : `R$ ${option.preco.toFixed(2).replace(".", ",")}`}
                  </span>
                </label>
              ))}
            </div>
          </RadioGroup>
        ) : (
          /* Erro */
          <div className="text-center py-8 text-orange-600">
            <p className="font-medium">Não foi possível calcular o frete</p>
            <p className="text-sm mt-2">
              {shippingError || "Verifique seu CEP e tente novamente."}
            </p>
          </div>
        )}

        {/* Botão Prosseguir */}
        <div className="flex justify-end mt-6">
          <NewButton
            label="Ir para Pagamento"
            icon={<CircleArrowRight />}
            onClick={handleNext}
            disabled={!isStepValid()}
            className={cn(
              "w-full md:w-1/3",
              isStepValid() && "bg-green-400 text-white hover:bg-green-500"
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
