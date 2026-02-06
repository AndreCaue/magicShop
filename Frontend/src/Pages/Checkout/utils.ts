import { getViaCep } from "@/Repositories/help";
import { getEstadoPorUF } from "@/helpers/estados";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { useShippingStore } from "@/stores/useShippingStore";
import { useCart } from "@/Hooks/useCart";
import type { UseFormSetValue } from "react-hook-form";
import type { TForm } from "./types";

export const fetchAddressByCep = async (
  cep: string,
  setValue: UseFormSetValue<TForm>,
) => {
  if (cep.length < 8) return;

  const response = await getViaCep(cep);

  console.log(response, "teste cep");

  if (response) {
    setValue("endereco", response.logradouro || "");
    setValue("bairro", response.bairro || "");
    setValue("cidade", response.localidade || "");
    setValue("estado", response.estado ?? getEstadoPorUF(response.uf));
    setValue("uf", response.uf);
    setValue("complemento", response.complemento || "");
  }
};

export const UseCalculateShipping = () => {
  const { items } = useCart();
  const { setShippingOptions, setSelectedShipping } = useShippingStore();

  return async (cepValue: string, setValue: UseFormSetValue<any>) => {
    const cleaned = cepValue.replace(/\D/g, "");
    if (cleaned.length !== 8) return;

    try {
      const payload = {
        cep_destino: cleaned,
        peso_gramas: items[0]?.weight || 500,
        largura_cm: items[0]?.width || 16,
        altura_cm: items[0]?.height || 6,
        comprimento_cm: items[0]?.length || 23,
        valor_declarado: items[0]?.unit_price || 0,
        cep_origem: "13454183",
      };

      const options = (await getShippingPrice(payload)).data;
      if (options.length === 0) return;

      setShippingOptions(options);
      const cheapest = options.reduce(
        (prev: { preco: number }, curr: { preco: number }) =>
          curr.preco < prev.preco ? curr : prev,
      );
      setSelectedShipping(cheapest);
      setValue("frete_opcao", cheapest.id, { shouldValidate: true });
    } catch (err) {
      console.error(err);
    }
  };
};

export const detectCardBrand = (cardNumber: string): string => {
  /*
    Visa:     4111 1111 1111 1111
Mastercard: 5555555555554444
Amex:     378282246310005
Elo:      6362970000457013 (ou 506699)
Hipercard: 6062825624254001
Validade: 12/30 (ou qualquer futura)
CVV: 123 (ou 1234 para Amex)
     */
  const cleaned = cardNumber.replace(/\D/g, "");

  if (!cleaned || cleaned.length < 6) return "";

  const bin = cleaned.slice(0, 6);

  if (/^4/.test(bin)) return "visa";
  if (/^5[1-5]/.test(bin)) return "mastercard";
  if (/^3[47]/.test(bin)) return "amex";
  if (/^(50[67]|50[89]|509|6277|63[67]|650|651)/.test(bin)) return "elo"; // simplificado
  if (/^(606282|3841)/.test(bin)) return "hipercard"; // simplificado

  return ""; // ou lance erro / peça ao usuário
};
