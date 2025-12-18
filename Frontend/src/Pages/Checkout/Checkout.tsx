import { PageContainer } from "../Home/Components/PageContainer";
import { AccordionForm } from "./Accordion";

export const Checkout = () => {
  return (
    <PageContainer>
      <div className="border border-red-500 lg:grid lg:grid-cols-3  ">
        <div
          id="mainCheckout"
          className="border border-blue-500 col-span-2 flex justify-center"
        >
          <AccordionForm />
        </div>

        <div id="total" className="border border-green-500">
          Seção de pagamento (resumo pedido)
        </div>
      </div>
    </PageContainer>
  );
};
