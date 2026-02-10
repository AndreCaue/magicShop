import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/Hooks/useCart";
import {
  useShippingStore,
  type ShippingOption,
} from "@/stores/useShippingStore";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { Link } from "react-router-dom";
import { Loader2, Truck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShippingPrice } from "../Checkout/Components/ShippingPrice";
import { RadioSuit } from "./Components/CustomRadio";

export default function CartSummary() {
  const { subtotal, items, discount } = useCart();

  const {
    shippingOptions,
    selectedShipping,
    isFreeShipping,
    setCep,
    setShippingOptions,
    setSelectedShipping,
  } = useShippingStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateShippingPrice = () => {
    if (Number(discount) >= (selectedShipping?.preco || 0)) {
      return 0;
    }
    return (selectedShipping?.preco || 0) - Number(discount);
  };

  const total = Number(subtotal) + calculateShippingPrice();

  const canProceedToCheckout = isFreeShipping || shippingOptions.length > 0;

  const handleCepChange = async (value: string) => {
    const cleanedCep = value.replace(/\D/g, "");
    setCep(cleanedCep);
    setError(null);

    if (cleanedCep.length !== 8) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    setLoading(true);

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
        setError("Nenhuma opção de entrega disponível para este CEP");
        setShippingOptions([]);
        setSelectedShipping(null);
      } else {
        setShippingOptions(options);
        const cheapest = options.reduce((prev, curr) =>
          curr.preco < prev.preco ? curr : prev,
        );
        setSelectedShipping(cheapest);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Erro ao calcular frete. Tente novamente.");
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateFreeShipping = () => {
    if (Number(discount ?? 0) >= (selectedShipping?.preco ?? 0)) {
      return true;
    }

    return false;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6">Resumo do pedido</h2>

      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">R$ {subtotal.replace(".", ",")}</span>
        </div>

        <div className="space-y-3 ">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Frete
            </span>

            {isFreeShipping ? (
              <span className="text-green-600 font-bold text-lg">Grátis!</span>
            ) : loading ? (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando...
              </span>
            ) : shippingOptions.length > 0 ? (
              <ShippingPrice
                price={selectedShipping?.preco}
                isFreeShipping={calculateFreeShipping()}
                discount={discount}
              />
            ) : (
              <span className="text-green-500 font-medium cursor-pointer hover:underline">
                CALCULAR
              </span>
            )}
          </div>

          <Input
            placeholder="Digite seu CEP"
            value={useShippingStore.getState().getFormattedCep()}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
            className="text-base text-black"
          />

          {!canProceedToCheckout && (
            <p className="text-sm text-gray-600 -mt-2 text-center">
              Digite seu CEP acima para calcular o frete e liberar o checkout
            </p>
          )}

          {isFreeShipping && (
            <p className="text-sm text-green-600 font-medium -mt-2">
              🎉 Parabéns! Você ganhou frete grátis
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2 -mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          {shippingOptions.length > 0 && !isFreeShipping && (
            <div className="space-y-2 py-3 border-t border-b">
              {shippingOptions.map((option) => {
                const isSelected = selectedShipping?.id === option.id;

                return <RadioSuit isSelected={isSelected} opt={option} />;
              })}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-indigo-600">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        <Link
          to="/checkout"
          className={cn(
            "w-full mt-6 py-4 rounded-lg font-medium text-center block transition",
            canProceedToCheckout
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed",
          )}
          onClick={(e) => !canProceedToCheckout && e.preventDefault()}
        >
          {canProceedToCheckout ? "Ir para o checkout" : "Calcule o frete"}
        </Link>

        <Link
          to="/"
          className="w-full text-center block mt-3 text-indigo-600 hover:underline"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
