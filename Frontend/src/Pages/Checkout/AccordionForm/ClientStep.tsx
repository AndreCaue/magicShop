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
import { CPFInputForm } from "@/components/new/CPFInputForm";

type Props = {
  navigateToSteps: (current: TStep, next: TStep) => Promise<void>;
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
};

export default function ClientStep({
  navigateToSteps,
  canOpenStep,
  form,
}: Props) {
  const { control } = form;

  const handleNext = async () => {
    const isValid = await form.trigger([
      "nome_cliente",
      "email",
      "celular",
      "cpf",
    ]);

    if (!isValid) return;

    await navigateToSteps("cliente", "endereco");
  };

  const watched = form.watch(["nome_cliente", "email", "celular"]);

  const isStepFilled = watched.every((v) => v && v.toString().trim() !== "");

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

        <CPFInputForm name="cpf" control={control} required />

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
          label="Celular"
          required
          placeholder="(11) 99999-9999"
        />

        <div className="flex justify-end mt-6">
          <NewButton
            label="Prosseguir"
            icon={<CircleArrowRight />}
            onClick={handleNext}
            disabled={!isStepFilled}
            className={cn(
              "w-full md:w-1/3",
              "bg-green-400 text-white hover:bg-green-500",
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
