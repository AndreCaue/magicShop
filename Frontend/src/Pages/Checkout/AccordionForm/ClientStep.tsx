import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputForm } from "@/components/new/InputForm";
import { CelularInputForm } from "@/components/new/CelularInputForm";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  goToNextStep: (current: TStep, next: TStep) => Promise<void>;
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
};

export default function ClientStep({ goToNextStep, canOpenStep, form }: Props) {
  const {
    control,
    formState: { errors },
  } = form;

  const isStepValid = () => {
    const fields = ["nome_cliente", "email"];
    return fields.every((field) => !errors[field as keyof TForm]);
  };

  const handleNext = async () => {
    await goToNextStep("cliente", "endereco");
  };

  return (
    <AccordionItem value="cliente">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("cliente")) {
            e.preventDefault();
          }
        }}
      >
        Dados do Cliente
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-5 px-5">
        <InputForm
          name="nome_cliente"
          control={control}
          label="Nome Completo"
          placeholder="Digite seu nome completo"
          required
        />

        <InputForm
          name="email"
          control={control}
          label="Email"
          placeholder="seuemail@exemplo.com"
          type="email"
          required
        />

        <CelularInputForm
          name="celular"
          control={control}
          label="Celular (opcional)"
          placeholder="(11) 99999-9999"
        />

        <div className="flex justify-end mt-6">
          <NewButton
            label="Prosseguir"
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
