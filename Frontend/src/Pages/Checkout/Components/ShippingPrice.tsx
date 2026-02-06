import { NewTooltip } from "@/components/new/Tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

type TShippingPrice = {
  price: number | undefined;
  discount: string | undefined;
  isFreeShipping: boolean | undefined;
};

export const ShippingPrice = ({
  price,
  isFreeShipping,
  discount,
}: TShippingPrice) => {
  const calculateDiscount = () => {
    const discountApply = (price ?? 0) - Number(discount);

    return discountApply;
  };

  const valueDiscounted = calculateDiscount();

  return (
    <div className="flex flex-col">
      <span className="relative inline-block font-medium text-gray-800">
        R$ {price?.toFixed(2)?.replace(".", ",")}
        <AnimatePresence>
          {(isFreeShipping || valueDiscounted) && (
            <>
              <motion.span
                className="absolute left-[-5%] top-1/2 h-[2px] w-[110%] bg-red-500"
                initial={{ scaleX: 0, rotate: 0, opacity: 0 }}
                animate={{ scaleX: 1, rotate: 10, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "center" }}
              />

              <motion.span
                className="absolute left-[-5%] top-1/2 h-[2px] w-[110%] bg-red-500"
                initial={{ scaleX: 0, rotate: 0, opacity: 0 }}
                animate={{ scaleX: 1, rotate: -10, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
                style={{ transformOrigin: "center" }}
              />
            </>
          )}
        </AnimatePresence>
      </span>
      {discount && (
        <span className="text-green-500 items-center justify-center text-end font-bold text-lg flex">
          <NewTooltip
            icon={<Info />}
            className="w-4 mt-1"
            textContent="Desconto do produto aplicado ao frete."
          />
          {isFreeShipping
            ? "Grátis"
            : valueDiscounted.toFixed(2)?.replace(".", ",")}
        </span>
      )}
    </div>
  );
};
