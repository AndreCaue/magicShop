import { InputForm } from "@/components/new/InputForm";
import type { UseFormReturn } from "react-hook-form";
import type { TForm } from "../types";
import {
  getInstallments,
  type TInstallment,
} from "@/Repositories/payment/payment";
import { detectCardBrand } from "../utils";
import { useState } from "react";
import { InputCardForm } from "@/components/new/InputCardForm";

type TCardPayment = {
  form: UseFormReturn<TForm>;
  selectedMethod: "cartao" | "pix" | "pagamento" | undefined;
  valorTotal: number | undefined;
};

export const CardPayment = ({
  form,
  selectedMethod,
  valorTotal,
}: TCardPayment) => {
  const [installments, setInstallments] = useState<TInstallment[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { control, watch, setValue } = form;

  const handleGetParcelas = async () => {
    if (installments.length) return;
    setLoading(true);

    const cardNumber =
      form.getValues("numero_cartao")?.replace(/\D/g, "") || "";
    const brand = detectCardBrand(cardNumber);

    const res = await getInstallments({ brand, total_value: valorTotal });
    setLoading(false);
    if (!res?.success) return;

    setInstallments(res.installments);
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length < 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  return (
    <>
      {selectedMethod === "cartao" && (
        <div className="mt-6 space-y-5 bg-gray-50 p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCardForm
              name="numero_cartao"
              control={control}
              label="Número do Cartão"
              placeholder="1234 5678 9012 34562"
              disabled={isLoading}
              onBlur={handleGetParcelas}
              onChangeValue={(e) => !e && setInstallments([])}
            />
            <InputForm
              name="nome_titular"
              control={control}
              label="Nome do Titular"
              disabled={isLoading}
              restrictInput={/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g}
              placeholder="Como está no cartão"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputForm
              name="validade"
              control={control}
              label="Validade"
              placeholder="MM/AA"
              formatValue={formatExpiry}
              disabled={isLoading}
              maxLength={5}
            />
            <InputForm
              name="cvv"
              control={control}
              label="CVV"
              placeholder="123"
              maxLength={4}
              restrictInput={/\D/g}
              disabled={isLoading}
              type="password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Parcelamento
            </label>
            <select
              className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300"
              value={watch("parcelas") ?? "1"}
              onChange={(e) => setValue("parcelas", e.target.value)}
              disabled={
                isLoading || !installments.length || !watch("numero_cartao")
              }
            >
              {installments.map((each) => (
                <option key={each.installment}>
                  {each.installment}x de R$ {each.installment_value.toFixed(2)}{" "}
                  {each.has_interest ? "" : "Sem juros"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
};
