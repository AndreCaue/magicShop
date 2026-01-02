import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<TForm>;
  onSubmit: () => void;
  total: number; // Total a pagar (incluindo frete e descontos)
  isSubmitting?: boolean; // Para mostrar loading no botão
};

export default function PaymentSummary({
  form,
  onSubmit,
  total,
  isSubmitting = false,
}: Props) {
  const { watch } = form;
  const selectedMethod = watch("pagamento");

  const getButtonLabel = () => {
    if (!selectedMethod) return "Selecione uma forma de pagamento";
    switch (selectedMethod) {
      case "pix":
        return "Gerar Pix";
      case "boleto":
        return "Gerar Boleto";
      case "cartao":
        return "Finalizar Compra";
      default:
        return "Finalizar Compra";
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      {/* Resumo */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-base font-medium">
          <span>Subtotal (produtos)</span>
          <span>{formatCurrency(total - 20)}</span>{" "}
          {/* Exemplo: ajuste conforme seu cálculo real */}
        </div>

        <div className="flex justify-between text-base font-medium">
          <span>Frete</span>
          <span>
            {total === 0 ? "Grátis" : formatCurrency(20)}{" "}
            {/* Exemplo: ajuste com frete real */}
          </span>
        </div>

        {/* Exemplo de desconto (opcional) */}
        {/* <div className="flex justify-between text-base font-medium text-green-600">
          <span>Desconto (cupom)</span>
          <span>-R$ 50,00</span>
        </div> */}

        <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-4">
          <span>Total a pagar</span>
          <span className="text-green-700">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Botão Finalizar */}
      <NewButton
        label={getButtonLabel()}
        icon={<CircleArrowRight />}
        onClick={onSubmit}
        disabled={!selectedMethod || isSubmitting}
        className={cn(
          "w-full py-7 text-lg font-semibold",
          selectedMethod
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gray-400 cursor-not-allowed text-white"
        )}
      />
    </div>
  );
}
