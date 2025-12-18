import { CelularInputForm } from "@/components/new/CelularInputForm";
import { CepInputForm } from "@/components/new/CepInputForm";
import { CheckboxForm } from "@/components/new/Checkbox";
import { InputForm } from "@/components/new/InputForm";
import { NewButton } from "@/components/new/NewButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { getViaCep, type TViaCepResponse } from "@/Repositories/help";
import { useUser } from "@/Services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

// const formSchema = z.object({
//   nome_cliente: z.string(),
//   email: z.string(),
//   celular: z.string().nullish(),

//   cep: z.string(),
//   endereco: z.string(), // verificar
//   complemento: z.string().optional(),
//   bairro: z.string(), //
//   cidade: z.string(), // number?
//   estado: z.string(), // number?
// });

const formSchema = z.object({
  nome_cliente: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  celular: z.string().nullish(),

  cep: z.string().min(9, "CEP inválido").max(9, "CEP inválido"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),

  habilitarEndereco: z.number().nullish(), //alterar para rua?
  habilitarBairro: z.number().nullish(), //alterar para rua?
  habilitarCidade: z.number().nullish(), //alterar para rua?
  habilitarEstado: z.number().nullish(), //alterar para rua?
});

const STEP_FIELDS = {
  cliente: ["nome_cliente", "email"],
  endereco: ["cep", "endereco", "complemento", "bairro", "cidade", "estado"],
} as const;

type TStep = keyof typeof STEP_FIELDS;

type TForm = z.infer<typeof formSchema>;

export const AccordionForm = () => {
  const { user } = useUser();
  const [activeStep, setActiveStep] = useState<TStep>("cliente");
  const [completedSteps, setCompletedSteps] = useState<TStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const onSubmit = () => {};

  const {
    control,
    setValue,
    watch,
    formState: { isSubmitting },
    handleSubmit,
  } = form;

  const handleFulfillEmail = () => {
    if (!user) return;
    console.log(user.email, "email dentro da func.");
    setValue("email", user.email);
  };

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length < 9) return;
    const _cep = cep.replace(/\D/g, "");
    setIsFetchingCep(true);
    const response = await getViaCep(_cep);
    setIsFetchingCep(false);
    if (!response) return;
    handleAddressFill(response);
  };

  const handleAddressFill = (address: TViaCepResponse) => {
    setValue("endereco", address.logradouro);
    setValue("complemento", address.complemento);
    setValue("bairro", address.bairro);
    setValue("estado", address.estado);
    setValue("cidade", address.localidade);
    setValue("endereco", address.logradouro);
  };

  const isStepValid = (step: TStep) => {
    const fields = STEP_FIELDS[step];

    return fields.every((field) => {
      const value = watch(field);
      const hasValue =
        value !== undefined && value !== null && String(value).trim() !== "";

      const hasError = !!form.formState.errors[field];

      return hasValue && !hasError;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    handleFulfillEmail();
    setIsLoading(false);
  }, [user]);

  const validateStep = async (step: TStep) => {
    const fields = STEP_FIELDS[step];
    const isValid = await form.trigger(fields);

    if (!isValid) return false;

    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));

    return true;
  };

  const goToNextStep = async (current: TStep, next: TStep) => {
    const isValid = await validateStep(current);
    if (!isValid) return;

    setActiveStep(next);
  };

  const canOpenStep = (step: TStep) => {
    if (step === activeStep) return true;
    if (completedSteps.includes(step)) return true;
    return false;
  };

  const {
    habilitarBairro,
    habilitarCidade,
    habilitarEndereco,
    habilitarEstado,
  } = watch();

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white"
      value={activeStep}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AccordionItem value="cliente">
            <AccordionTrigger
              onClick={(e) => {
                if (!canOpenStep("cliente")) {
                  e.preventDefault();
                  return;
                }
                setActiveStep("cliente");
              }}
            >
              Dados do Cliente
            </AccordionTrigger>
            <AccordionContent
              id="dadosCliente"
              className="flex flex-col gap-5 text-balance px-5"
            >
              <InputForm
                name="nome_cliente"
                control={control}
                required
                label="Nome"
              />
              <InputForm
                name="email"
                control={control}
                required
                label="Email"
              />
              <CelularInputForm
                name="celular"
                control={control}
                label="Celular (opcional)"
              />

              <NewButton
                label="Continue"
                onClick={() => goToNextStep("cliente", "endereco")}
                disabled={!isStepValid("cliente")}
                className={cn(
                  "w-44 self-end",
                  isStepValid("cliente") &&
                    "bg-green-400 text-white hover:bg-green-500"
                )}
                isSkeletonLoading={isLoading}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="endereco">
            <AccordionTrigger>Detalhes da Entrega</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 text-balance px-5">
              <CepInputForm
                name="cep"
                control={control}
                label="CEP"
                onChangeValue={fetchAddressByCep}
                disabled={isFetchingCep}
              />
              <div>
                <InputForm
                  name="endereco"
                  control={control}
                  label="Endereço"
                  disabled={isFetchingCep}
                />
              </div>

              <InputForm
                name="complemento"
                control={control}
                label="Complemento"
                disabled={isFetchingCep}
              />
              <InputForm
                name="bairro"
                control={control}
                label="Bairro"
                disabled={isFetchingCep}
              />
              <InputForm
                name="cidade"
                control={control}
                label="Cidade"
                disabled={isFetchingCep}
              />

              <div className="flex flex-col gap-1">
                <InputForm
                  name="estado"
                  control={control}
                  label="Estado"
                  disabled={!habilitarEstado || isFetchingCep}
                />

                <CheckboxForm
                  name="habilitarEstado"
                  className="place-self-end"
                  control={control}
                  options={[{ text: "teste", value: 1 }]}
                  disabled={isFetchingCep}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Método de Entrega</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 text-balance px-5">
              Trazer do carrinho ou algo assim (TO DO)
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Pagamento</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 text-balance px-5 ">
              <InputForm
                name="nome_cliente"
                control={control}
                label="Nome Impresso no Cartão"
                disabled={isFetchingCep}
              />
              <InputForm
                name="nome_cliente"
                control={control}
                label="Número do Cartão"
                disabled={isFetchingCep}
              />
              <InputForm
                name="nome_cliente"
                control={control}
                label="Data de Validade"
                disabled={isFetchingCep}
              />
              <InputForm name="nome_cliente" control={control} label="CVV" />
              <InputForm
                name="nome_cliente"
                control={control}
                label="Número de Parcelas"
                disabled={isFetchingCep}
              />
            </AccordionContent>
          </AccordionItem>
        </form>
      </Form>
    </Accordion>
  );
};
