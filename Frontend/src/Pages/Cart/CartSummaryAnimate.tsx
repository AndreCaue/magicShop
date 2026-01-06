import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useCart } from "@/Hooks/useCart";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { Link } from "react-router-dom";
import { Loader2, Truck, AlertCircle, CheckCircle2 } from "lucide-react";

interface ShippingOption {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  preco_com_desconto: number;
  prazo_dias: number;
}

export default function CartSummaryAnimate() {
  const { subtotal, items } = useCart();
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreeShipping = Number(subtotal) > 250;

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

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Frete
            </span>

            {isFreeShipping ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-green-600 font-bold text-lg"
              >
                Grátis!
              </motion.span>
            ) : loading ? (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculando...
              </span>
            ) : shippingOptions.length > 0 ? (
              <motion.span
                key={selectedShipping?.preco}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-bold text-sm"
              >
                R$ {selectedShipping?.preco.toFixed(2).replace(".", ",")}
              </motion.span>
            ) : (
              <span className="text-green-500 font-medium cursor-pointer hover:underline">
                CALCULAR
              </span>
            )}
          </div>

          <Input
            placeholder="Digite seu CEP"
            value={cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
            onChange={(e) => handleCepChange(e.target.value)}
            maxLength={9}
            className="text-base text-black"
          />

          {isFreeShipping && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 font-medium -mt-2"
            >
              🎉 Parabéns! Você ganhou frete grátis
            </motion.p>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-red-600 flex items-center gap-2 -mt-2"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}

          <AnimatePresence>
            {shippingOptions.length > 0 && !isFreeShipping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-2 py-3 border-t border-b overflow-hidden"
              >
                {shippingOptions.map((option, index) => (
                  <motion.label
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between cursor-pointer py-3 px-3 -mx-3 rounded-lg hover:bg-indigo-50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.id === option.id}
                          onChange={() => setSelectedShipping(option)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedShipping?.id === option.id
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedShipping?.id === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
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

                    <span className="font-bold text-sm">
                      R$ {option.preco.toFixed(2).replace(".", ",")}
                    </span>
                  </motion.label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.4 }}
              className="text-indigo-600"
            >
              R$ {total.toFixed(2).replace(".", ",")}
            </motion.span>
          </div>
        </div>

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
