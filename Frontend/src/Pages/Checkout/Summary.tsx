import { NewTooltip } from "@/components/new/Tooltip";
import { useCart } from "@/Hooks/useCart";
import { cn } from "@/lib/utils";
import { useShippingStore } from "@/stores/useShippingStore";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

type TRow = {
  label: string;
  price?: string | undefined;
  showIcon?: boolean;
  isDiscount?: boolean;
};

const Row = ({ label, price, showIcon, isDiscount }: TRow) => {
  return (
    <div className="flex justify-between w-full">
      <span className="flex gap-2">
        {label}:{" "}
        {showIcon && (
          <NewTooltip
            icon={<Info />}
            link="/"
            className="text-green-500"
            textContent="Desconto do produto aplicado"
          />
        )}
      </span>
      <span className={cn("", isDiscount && "text-green-500")}>
        {isDiscount && "-"} R$ {price || "0"}
      </span>
    </div>
  );
};

export const Summary = () => {
  const { items, subtotal, discount } = useCart();
  const { selectedShipping } = useShippingStore();
  const [isFreeShipping, setIsFreeShipping] = useState(false);

  const getTotal = () => {
    const frete = (selectedShipping?.preco || 0) - Number(discount);

    if (isFreeShipping) {
      return subtotal;
    }

    const value = Number(subtotal) + frete;
    return value.toFixed(2);
  };

  useEffect(() => {
    if (!selectedShipping) return;

    (() => {
      if (Number(discount) >= selectedShipping?.preco)
        return setIsFreeShipping(true);

      return setIsFreeShipping(false);
    })();
  }, [selectedShipping?.preco, discount]);

  return (
    <div className="text-white mx-10">
      <h1 className="text-2xl py-2 w-full text-center">
        Resumo do Pedido
        <div className="border-b mx-32" />
      </h1>
      {items.map((item) => (
        <div className="flex justify-between">
          <span key={item.id}>- {item.product_name}</span>
          <span>Qntd: {item.quantity}</span>
        </div>
      ))}
      <div className="border-b mx-10 my-4" />

      <div className="flex flex-col gap-2">
        <Row label="Subtotal" price={subtotal} />
        {selectedShipping && !isFreeShipping ? (
          <>
            <Row
              label="Frete"
              price={selectedShipping?.preco.toFixed(2) || "0"}
            />
            <Row
              label="Descontos no frete"
              price={discount}
              showIcon
              isDiscount
            />
          </>
        ) : (
          <Row label="Frete" price={"Grátis"} isDiscount />
        )}

        <div className="border-b mx-10 my-4" />
      </div>

      <div className="flex justify-between ">
        <span>Total:</span>
        <span>{getTotal()}</span>
      </div>
    </div>
  );
};
