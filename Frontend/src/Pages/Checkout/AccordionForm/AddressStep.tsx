import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CepInputForm } from "@/components/new/CepInputForm";
import { InputForm } from "@/components/new/InputForm";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { fetchAddressByCep } from "../utils";
import {
  useShippingStore,
  type ShippingOption,
} from "@/stores/useShippingStore";
import { useCart } from "@/Hooks/useCart";
import { getShippingPrice } from "@/Repositories/shipping/calculate";

type Props = {
  goToNextStep: (current: TStep, next: TStep) => Promise<void>;
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
};

export default function AddressStep({
  goToNextStep,
  canOpenStep,
  form,
}: Props) {
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const { items } = useCart();

  const {
    cep: cepFromStore,
    setCep,
    setSelectedShipping,
    setShippingOptions,
  } = useShippingStore();

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const isStepValid = () => {
    const fields = [
      "cep",
      "endereco",
      "numero_casa",
      "bairro",
      "cidade",
      "estado",
    ];
    return fields.every((field) => !errors[field as keyof TForm]);
  };

  const handleNext = async () => {
    await goToNextStep("endereco", "entrega");
  };

  const handleCepChange = async (cep: string) => {
    if (cep.length < 9) return;
    setIsFetchingCep(true);
    const cleaned = cep.replace(/\D/g, "");
    await fetchAddressByCep(cleaned, form.setValue);
    await handleCalculateShipping(cleaned);
    setIsFetchingCep(false);
  };

  useEffect(() => {
    (async () => {
      await fetchAddressByCep(cepFromStore, form.setValue);
    })();
  }, [cepFromStore, form.setValue]);

  const handleCalculateShipping = async (value: string) => {
    const cleanedCep = value.replace(/\D/g, "");
    setCep(cleanedCep);

    if (cleanedCep.length !== 8) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    try {
      const payload = {
        cep_destino: cleanedCep,
        peso_gramas: items[0]?.weight || 500,
        largura_cm: items[0]?.width || 16,
        altura_cm: items[0]?.height || 6,
        comprimento_cm: items[0]?.length || 23,
        valor_declarado: items[0]?.unit_price || 0,
        cep_origem: "13454056",
      };

      const options: ShippingOption[] = (await getShippingPrice(payload)).data;

      if (options.length === 0) {
        setShippingOptions([]);
        setSelectedShipping(null);
      } else {
        setShippingOptions(options);
        const cheapest = options.reduce((prev, curr) =>
          curr.preco < prev.preco ? curr : prev
        );
        setSelectedShipping(cheapest);
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  };

  watch("cep");

  return (
    <AccordionItem value="endereco">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("endereco")) {
            e.preventDefault();
          }
        }}
      >
        Detalhes da Entrega
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-5 px-5">
        <CepInputForm
          name="cep"
          control={control}
          label="CEP"
          required
          onChangeValue={handleCepChange}
          disabled={isFetchingCep}
        />

        {isFetchingCep && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
            <span className="text-gray-600">Buscando endereço...</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <InputForm
            name="endereco"
            control={control}
            label="Rua/Endereço"
            required
            className="flex-1"
            disabled={isFetchingCep}
          />
          <InputForm
            name="numero_casa"
            control={control}
            label="Nº"
            required
            className="w-full md:w-32"
            disabled={isFetchingCep}
          />
        </div>

        <InputForm
          name="complemento"
          control={control}
          label="Complemento (opcional)"
          disabled={isFetchingCep}
        />

        <InputForm
          name="bairro"
          control={control}
          label="Bairro"
          required
          disabled={isFetchingCep}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <InputForm
            name="cidade"
            control={control}
            label="Cidade"
            required
            className="flex-1"
            disabled={isFetchingCep}
          />
          <InputForm
            name="estado"
            control={control}
            label="Estado"
            required
            className="w-full md:w-32"
            disabled={isFetchingCep}
          />
        </div>

        <div className="flex justify-end mt-6">
          <NewButton
            label="Prosseguir"
            icon={<CircleArrowRight />}
            onClick={handleNext}
            disabled={!isStepValid() || isFetchingCep}
            className={cn(
              "w-full md:w-1/3",
              isStepValid() &&
                !isFetchingCep &&
                "bg-green-400 text-white hover:bg-green-500"
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
