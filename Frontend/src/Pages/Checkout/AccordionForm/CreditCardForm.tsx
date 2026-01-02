import { InputForm } from "@/components/new/InputForm";
import { UseFormReturn } from "react-hook-form";
import { type TForm } from "../types";

type Props = {
  form: UseFormReturn<TForm>;
};

export default function CreditCardForm({ form }: Props) {
  const { control, watch, setValue } = form;

  return (
    <div className="mt-6 space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número do cartão */}
        <InputForm
          name="numero_cartao"
          control={control}
          label="Número do Cartão"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          // Sugestão: adicionar máscara com react-input-mask
          // Exemplo:
          // mask="9999 9999 9999 9999"
          // onChange={(e) => {
          //   const value = e.target.value.replace(/\D/g, "");
          //   setValue("numero_cartao", value);
          // }}
        />

        {/* Nome do titular */}
        <InputForm
          name="nome_titular"
          control={control}
          label="Nome do Titular"
          placeholder="Como está impresso no cartão"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Validade */}
        <InputForm
          name="validade"
          control={control}
          label="Validade"
          placeholder="MM/AA"
          maxLength={5}
          // Sugestão: máscara MM/AA
          // mask="99/99"
        />

        {/* CVV */}
        <InputForm
          name="cvv"
          control={control}
          label="CVV"
          placeholder="123"
          maxLength={4}
          type="password"
        />
      </div>

      {/* Parcelamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parcelamento
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={watch("parcelas") ?? "1"}
          onChange={(e) => setValue("parcelas", e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}x de R$ {/* total / n */ (100).toFixed(2)}
              {n > 1 ? " sem juros" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
