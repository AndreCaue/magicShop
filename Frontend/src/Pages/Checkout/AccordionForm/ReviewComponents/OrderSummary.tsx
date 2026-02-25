import { NewTooltip } from "@/components/new/Tooltip";
import { cn } from "@/lib/utils";
import type { ShippingOption } from "@/stores/useShippingStore";
import { Info } from "lucide-react";

type TOrderSummary = {
  subtotal: string;
  selectedShipping: ShippingOption | null;
  discount: string | undefined;
};

export const OrderSummary = ({
  discount,
  selectedShipping,
  subtotal,
}: TOrderSummary) => {
  const isFreeShipping = (selectedShipping?.preco || 0) <= Number(discount);

  const shippingWithDescount = !isFreeShipping
    ? (selectedShipping?.preco || 0) - Number(discount)
    : 0;

  const calculateTotal = () => {
    if (isFreeShipping) return subtotal;

    return (Number(subtotal) + shippingWithDescount).toFixed(2);
  };

  const total = calculateTotal();

  return (
    <section className="px-6 py-6 bg-gray-50/60">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="text-gray-900">
            R$ {Number(subtotal).toFixed(2).replace(".", ",")}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Frete</dt>
          <dd
            className={cn(
              "text-gray-900",
              isFreeShipping && "text-emerald-700",
            )}
          >
            {isFreeShipping
              ? "Grátis"
              : `R$ ${shippingWithDescount.toFixed(2)}`}
          </dd>
        </div>
        {(Number(discount) || 0) > 0 && (
          <div className="flex justify-between text-emerald-700">
            <dt className="flex justify-center items-center gap-2">
              Desconto no Frete
              <NewTooltip
                icon={<Info />}
                className="w-4 mt-1"
                isShippingTip
                textContent="Desconto do produto aplicado ao frete."
              />
            </dt>
            <dd>
              {!isFreeShipping
                ? `-R$ ${(Number(discount) || 0).toFixed(2).replace(".", ",")}`
                : "Frete Grátis"}
            </dd>
          </div>
        )}
        <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
          <dt className="text-base font-semibold text-gray-900">Total</dt>
          <dd className="text-2xl font-bold text-gray-900">R$ {total}</dd>
        </div>
      </dl>
    </section>
  );
};
