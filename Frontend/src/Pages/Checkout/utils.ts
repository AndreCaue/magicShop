import { getViaCep } from "@/Repositories/help";
import { getEstadoPorUF } from "@/helpers/estados";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { useShippingStore } from "@/stores/useShippingStore";
import { useCart } from "@/Hooks/useCart";
import type { UseFormSetValue } from "react-hook-form";
import type { TForm } from "./types";

export const fetchAddressByCep = async (
  cep: string,
  setValue: UseFormSetValue<TForm>
) => {
  if (cep.length < 8) return;

  // const cleaned = cep.replace(/\D/g, "");
  const response = await getViaCep(cep);

  if (response) {
    setValue("endereco", response.logradouro || "");
    setValue("bairro", response.bairro || "");
    setValue("cidade", response.localidade || "");
    setValue("estado", response.estado ?? getEstadoPorUF(response.uf));
    setValue("complemento", response.complemento || "");
  }
};

// const handleCepChange = async (value: string) => {
//   const cleanedCep = value.replace(/\D/g, "");
//   setCep(cleanedCep);
//   setError(null);

//   if (cleanedCep.length !== 8) {
//     setShippingOptions([]);
//     setSelectedShipping(null);
//     return;
//   }

//   setLoading(true);

//   try {
//     const payload = {
//       cep_destino: cleanedCep,
//       peso_gramas: items[0]?.weight || 500,
//       largura_cm: items[0]?.width || 16,
//       altura_cm: items[0]?.height || 6,
//       comprimento_cm: items[0]?.length || 23,
//       valor_declarado: items[0]?.unit_price || 0,
//       cep_origem: "13454056",
//     };

//     const options: ShippingOption[] = (await getShippingPrice(payload)).data;

//     if (options.length === 0) {
//       setError("Nenhuma opção de entrega disponível para este CEP");
//       setShippingOptions([]);
//       setSelectedShipping(null);
//     } else {
//       setShippingOptions(options);
//       const cheapest = options.reduce((prev, curr) =>
//         curr.preco < prev.preco ? curr : prev
//       );
//       setSelectedShipping(cheapest);
//     }
//   } catch (err) {
//     console.error("Erro ao calcular frete:", err);
//     setError("Erro ao calcular frete. Tente novamente.");
//     setShippingOptions([]);
//     setSelectedShipping(null);
//   } finally {
//     setLoading(false);
//   }
// };

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
      const cheapest = options.reduce((prev, curr) =>
        curr.preco < prev.preco ? curr : prev
      );
      setSelectedShipping(cheapest);
      setValue("frete_opcao", cheapest.id, { shouldValidate: true });
    } catch (err) {
      console.error(err);
    }
  };
};
