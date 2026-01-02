import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion } from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useUser } from "@/Services/userService";
import { useShippingStore } from "@/stores/useShippingStore";
import { formSchema } from "../schema";
import { STEP_FIELDS, type TForm, type TStep } from "../types";
import ClientStep from "./ClientStep";
import AddressStep from "./AddressStep";
import ShippingStep from "./ShippingStep";
import PaymentStep from "./PaymentStep";

export const AccordionForm = () => {
  const { user } = useUser();
  const { cep: cepFromStore } = useShippingStore();
  const [activeStep, setActiveStep] = useState<TStep>("cliente");
  const [completedSteps, setCompletedSteps] = useState<TStep[]>([]);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      celular: "",
      complemento: "",
      numero_casa: "",
      pagamento: undefined,
      numero_cartao: "",
      nome_titular: "",
      validade: "",
      cvv: "",
      parcelas: "1",
    },
  });

  const { setValue, watch } = form;
  //parei aqui.
  //valor do cep não atualiza automaticamente ao setar value pelo zustend.
  // não retrocede de aba.
  useEffect(() => {
    if (user?.email) setValue("email", user.email);
  }, [user, setValue]);

  useEffect(() => {
    if (cepFromStore.length === 8) {
      const formatted = cepFromStore.replace(/(\d{5})(\d{3})/, "$1-$2");
      setValue("cep", formatted);
    }
  }, [cepFromStore, setValue]);

  const goToNextStep = async (current: TStep, next: TStep) => {
    const fields = STEP_FIELDS[current];
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCompletedSteps((prev) => [...prev, current]);
      setActiveStep(next);
    }
  };

  const canOpenStep = (step: TStep) =>
    step === activeStep || completedSteps.includes(step);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white"
      value={activeStep}
    >
      <Form {...form}>
        <form>
          <ClientStep
            goToNextStep={goToNextStep}
            canOpenStep={canOpenStep}
            form={form}
          />
          <AddressStep
            goToNextStep={goToNextStep}
            canOpenStep={canOpenStep}
            form={form}
          />
          <ShippingStep
            goToNextStep={goToNextStep}
            canOpenStep={canOpenStep}
            form={form}
          />
          <PaymentStep
            canOpenStep={canOpenStep}
            form={form}
            onSubmit={form.handleSubmit((data) => {
              console.log("Finalizar:", data);
              // Integração de pagamento aqui
            })}
          />
        </form>
      </Form>
    </Accordion>
  );
};
