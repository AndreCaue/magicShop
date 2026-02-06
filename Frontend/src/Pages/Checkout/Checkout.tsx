import { PageContainer } from "../Home/Components/PageContainer";
import { AccordionForm } from "./AccordionForm";
import { Summary } from "./Summary";

export const Checkout = () => {
  return (
    <PageContainer>
      <div className="lg:grid lg:grid-cols-3 mt-5 lg:h-full bg-gradient-to-br from-slate-900 via-gray-800 to-gray-700 ">
        <AccordionForm />

        <Summary />
      </div>
    </PageContainer>
  );
};
