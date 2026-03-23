import { getViaCep } from "@/Repositories/help";
import { getEstadoPorUF } from "@/helpers/estados";
import {
  useShippingStore,
  type ShippingOption,
} from "@/stores/useShippingStore";
import { useCart } from "@/Hooks/useCart";
import type { UseFormSetValue } from "react-hook-form";
import type { TForm } from "./types";
import { getShippingPrice } from "@/Repositories/melhorenvio/frete";
const CEP_ORIGEM = import.meta.env.VITE_CEP_ORIGEM;

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
        itens: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        cep_destino: cleaned,
        valor_declarado: items.reduce(
          (acc, item) => acc + item.unit_price * item.quantity,
          0,
        ),
        cep_origem: CEP_ORIGEM,
      };

      const options: ShippingOption[] = await getShippingPrice(payload);
      if (options.length === 0) return;

      setShippingOptions(options);
      const cheapest = options.reduce((prev, curr) =>
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
  const cleaned = cardNumber.replace(/\D/g, "");

  if (!cleaned || cleaned.length < 6) return "";

  const bin = cleaned.slice(0, 6);

  if (/^4/.test(bin)) return "visa";
  if (/^5[1-5]/.test(bin)) return "mastercard";
  if (/^3[47]/.test(bin)) return "amex";
  if (/^(50[67]|50[89]|509|6277|63[67]|650|651)/.test(bin)) return "elo";
  if (/^(606282|3841)/.test(bin)) return "hipercard";

  return "";
};
