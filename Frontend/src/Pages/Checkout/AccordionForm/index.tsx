import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion } from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useShippingStore } from "@/stores/useShippingStore";
import { formSchema } from "../schema";
import { STEP_FIELDS, type TForm, type TStep } from "../types";
import ClientStep from "./ClientStep";
import AddressStep from "./AddressStep";
import ShippingStep from "./ShippingStep";
import PaymentStep from "./PaymentStep";
import { useAuth } from "@/Hooks/useAuth";

export const AccordionForm = () => {
  const { user } = useAuth();
  const { cep: cepFromStore } = useShippingStore();
  const [activeStep, setActiveStep] = useState<TStep>("cliente");
  const [completedSteps, setCompletedSteps] = useState<TStep[]>([]);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
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

  const { setValue } = form;

  useEffect(() => {
    if (user?.email) setValue("email", user.email);
  }, [user, setValue]);

  useEffect(() => {
    if (cepFromStore.length === 8) {
      const formatted = cepFromStore.replace(/(\d{5})(\d{3})/, "$1-$2");
      setValue("cep", formatted);
    }
  }, [cepFromStore, setValue]);

  const navigateToSteps = async (
    current: TStep,
    next: TStep,
    previous?: boolean,
  ) => {
    if (previous) {
      setActiveStep(next);
      return;
    }

    const fields = STEP_FIELDS[current];
    const isValid = await form.trigger(fields);

    if (!isValid) return;

    setCompletedSteps((prev) =>
      prev.includes(current) ? prev : [...prev, current],
    );
    setActiveStep(next);
  };

  const canOpenStep = (step: TStep) =>
    step === activeStep || completedSteps.includes(step);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white pb-20 col-span-2"
      value={activeStep}
    >
      <Form {...form}>
        <form>
          <ClientStep
            navigateToSteps={navigateToSteps}
            canOpenStep={canOpenStep}
            form={form}
          />
          <AddressStep
            navigateToSteps={navigateToSteps}
            canOpenStep={canOpenStep}
            form={form}
          />
          <ShippingStep
            navigateToSteps={navigateToSteps}
            canOpenStep={canOpenStep}
            form={form}
          />
          <PaymentStep
            navigateToSteps={navigateToSteps}
            canOpenStep={canOpenStep}
            form={form}
          />
        </form>
      </Form>
    </Accordion>
  );
};
