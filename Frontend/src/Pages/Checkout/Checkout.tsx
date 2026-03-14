import { useCart } from "@/Hooks/useCart";
import { PageContainer } from "../Home/Components/PageContainer";
import { AccordionForm } from "./AccordionForm";
import { Summary } from "./Summary";
import { SmokeLink } from "@/components/new/SmokeLink";
import {
  getOrderIfHas,
  type TGetOrderIfHas,
} from "@/Repositories/payment/orders";
import { useEffect, useState } from "react";

import { HasOrderDialog } from "./HasOrderDialog";

export const Checkout = () => {
  const { items } = useCart();
  const [hasOrder, setHasOrder] = useState<TGetOrderIfHas>();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getOrderIfHas();
      console.log(res);
      if (!res) return;
      setOpen(res?.success);
      setHasOrder(res);
    })();
  }, []);

  if (hasOrder)
    return <HasOrderDialog data={hasOrder} isOpen={isOpen} setOpen={setOpen} />;

  return (
    <PageContainer>
      {items.length > 0 ? (
        <div className="lg:grid lg:grid-cols-3 mt-5 lg:h-full bg-gradient-to-br from-slate-900 via-gray-800 to-gray-700 ">
          <AccordionForm />
          <Summary />
        </div>
      ) : (
        <div className=" text-white flex flex-col gap-5">
          <span className="text-2xl">Sem itens no carrinho</span>
          <SmokeLink goTo="/" textLabel="Voltar" />
        </div>
      )}
    </PageContainer>
  );
};
