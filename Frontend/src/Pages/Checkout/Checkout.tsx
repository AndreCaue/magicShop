import { useCart } from "@/Hooks/useCart";
import { PageContainer } from "../Home/Components/PageContainer";
import { AccordionForm } from "./AccordionForm";
import { Summary } from "./Summary";
import { SmokeLink } from "@/components/new/SmokeLink";
import {
  getOrderIfHas,
  type TGetOrderIfHas,
} from "@/Repositories/payment/orders";
import { useState } from "react";

import { HasOrderDialog } from "./HasOrderDialog";
import { SymbolLoading } from "@/components/new/CustomLoading/SymbolLoading";
import { useQuery } from "@tanstack/react-query";

export const Checkout = () => {
  const { items } = useCart();
  const [isOpen, setOpen] = useState(false);

  const { data: hasOrder, isLoading } = useQuery<TGetOrderIfHas | null>({
    queryKey: ["existingOrder"],
    queryFn: () => getOrderIfHas(),
  });

  if (hasOrder?.success)
    return <HasOrderDialog data={hasOrder} isOpen={isOpen} setOpen={setOpen} />;

  if (isLoading) return <SymbolLoading />;

  return (
    <PageContainer>
      {items.length > 0 ? (
        <div className="lg:grid lg:grid-cols-3 mt-5 lg:h-full bg-gradient-to-br from-slate-900 via-gray-800 to-gray-700 ">
          <AccordionForm />
          <Summary />
        </div>
      ) : (
        <div className=" text-white flex flex-col gap-5">
          <SymbolLoading />
          <span className="text-2xl">Sem itens no carrinho</span>
          <SmokeLink goTo="/" textLabel="Voltar" />
        </div>
      )}
    </PageContainer>
  );
};
