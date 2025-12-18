// src/components/cart/CartSummary.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/Hooks/useCart";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { Link } from "react-router-dom";
import { Loader2, Truck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ShippingOption {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  preco_com_desconto: number;
  prazo_dias: number;
}

export default function CartSummary() {
  const { subtotal, items } = useCart();
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreeShipping = Number(subtotal) > 250;

  // Frete grátis ou valor selecionado
  const shippingPrice = isFreeShipping ? 0 : selectedShipping?.preco || 0;
  const total = Number(subtotal) + shippingPrice;

  const handleCepChange = async (value: string) => {
    const cleanedCep = value.replace(/\D/g, "");
    setCep(cleanedCep);

    if (cleanedCep.length !== 8) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Por enquanto só 1 item — no futuro, some dimensões/peso de todos os items
      const payload = {
        cep_destino: cleanedCep,
        peso_gramas: items[0]?.weight || 500,
        largura_cm: items[0]?.width || 16,
        altura_cm: items[0]?.height || 6,
        comprimento_cm: items[0]?.length || 23,
        valor_declarado: items[0]?.unit_price || 0,
        cep_origem: "13454183",
      };

      const options: ShippingOption[] = (await getShippingPrice(payload)).data;

      if (options.length === 0) {
        setError("Nenhuma opção de entrega disponível para este CEP");
        setShippingOptions([]);
        setSelectedShipping(null);
      } else {
        setShippingOptions(options);
        // Seleciona automaticamente a mais barata
        const cheapest = options.reduce((prev, curr) =>
          curr.preco < prev.preco ? curr : prev
        );
        setSelectedShipping(cheapest);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao calcular frete. Tente novamente.");
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6">Resumo do pedido</h2>

      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium">R$ {subtotal.replace(".", ",")}</span>
        </div>

        {/* Frete */}
        <div className="space-y-3">
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
              <span className="font-medium">
                R$ {selectedShipping?.preco.toFixed(2).replace(".", ",")}
              </span>
            ) : (
              <span className="text-green-500 font-medium cursor-pointer hover:underline">
                CALCULAR
              </span>
            )}
          </div>

          {/* Campo CEP */}
          <Input
            placeholder="Digite seu CEP"
            value={cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
            className="text-base text-black"
          />

          {/* Mensagem de frete grátis */}
          {isFreeShipping && (
            <p className="text-sm text-green-600 font-medium -mt-2">
              🎉 Parabéns! Você ganhou frete grátis
            </p>
          )}

          {/* Erro */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2 -mt-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          {/* Lista de opções de frete */}
          {shippingOptions.length > 0 && !isFreeShipping && (
            <div className="space-y-2 py-3 border-t border-b">
              {shippingOptions.map((option) => {
                const isSelected = selectedShipping?.id === option.id;

                return (
                  <motion.label
                    key={option.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedShipping(option)} // ← AQUI! Clique global
                    className="flex items-center justify-between cursor-pointer py-2
                     hover:bg-gray-50 rounded-lg px-2 -mx-2 select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Custom Radio */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-all ${
                isSelected ? "border-indigo-600" : "border-gray-300"
              }`}
                      >
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="text-indigo-600 text-xs"
                          >
                            ♠
                          </motion.span>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-sm">
                          {option.nome} - {option.empresa}
                        </p>
                        <p className="text-xs text-gray-500">
                          Entrega em até {option.prazo_dias} dias úteis
                        </p>
                      </div>
                    </div>

                    <span className="font-semibold text-sm">
                      R$ {option.preco.toFixed(2).replace(".", ",")}
                    </span>

                    {/* Radio real escondido (acessibilidade) */}
                    <input
                      type="radio"
                      name="shipping"
                      checked={isSelected}
                      onChange={() => {}}
                      className="hidden"
                    />
                  </motion.label>
                );
              })}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-indigo-600">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        {/* Botões */}
        <Link
          to="/checkout"
          className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-lg font-medium hover:bg-indigo-700 transition text-center block"
        >
          Ir para o checkout
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
