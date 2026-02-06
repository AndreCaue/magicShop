import {
  useShippingStore,
  type ShippingOption,
} from "@/stores/useShippingStore";
import { motion } from "framer-motion";

type TRadioSuit = {
  opt: ShippingOption;
  isSelected: boolean;
};

export const RadioSuit = ({ opt, isSelected }: TRadioSuit) => {
  const { setSelectedShipping } = useShippingStore();

  return (
    <motion.label
      key={opt.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedShipping(opt)}
      className="flex items-center justify-between cursor-pointer py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 select-none"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
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
            {opt.nome} - {opt.empresa}
          </p>
          <p className="text-xs text-gray-500">
            Entrega em até {opt.prazo_dias} dias úteis
          </p>
        </div>
      </div>

      <span className="font-semibold text-sm">
        R$ {opt.preco.toFixed(2).replace(".", ",")}
      </span>

      <input
        type="radio"
        name="shipping"
        checked={isSelected}
        onChange={() => {}}
        className="hidden"
      />
    </motion.label>
  );
};
