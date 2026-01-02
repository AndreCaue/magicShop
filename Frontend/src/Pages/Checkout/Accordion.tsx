// src/components/checkout/AccordionForm.tsx
import { CelularInputForm } from "@/components/new/CelularInputForm";
import { CepInputForm } from "@/components/new/CepInputForm";
import { InputForm } from "@/components/new/InputForm";
import { NewButton } from "@/components/new/NewButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { getViaCep } from "@/Repositories/help";
import {
  useShippingStore,
  type ShippingOption,
} from "@/stores/useShippingStore";
import { useUser } from "@/Services/userService";
import { useCart } from "@/Hooks/useCart";
import { getShippingPrice } from "@/Repositories/shipping/calculate";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { getEstadoPorUF } from "@/helpers/estados";

// Schema Zod completo
const formSchema = z
  .object({
    // Cliente
    nome_cliente: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    celular: z.string().nullish(),

    // Endereço
    cep: z.string().min(9, "CEP inválido").max(9, "CEP inválido"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    numero_casa: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(1, "Estado é obrigatório"),

    // Entrega
    frete_opcao: z.string().min(1, "Selecione uma opção de entrega"),

    // Pagamento
    pagamento: z.enum(["pix", "cartao", "boleto"], {
      required_error: "Selecione uma forma de pagamento",
      invalid_type_error: "Forma de pagamento inválida",
    }),

    // Campos do cartão (opcional, só usados se pagamento === "cartao")
    numero_cartao: z.string().optional(),
    nome_titular: z.string().optional(),
    validade: z.string().optional(),
    cvv: z.string().optional(),
    parcelas: z.string().optional(),
  })
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      (data.numero_cartao &&
        data.numero_cartao.replace(/\D/g, "").length >= 13 &&
        data.numero_cartao.replace(/\D/g, "").length <= 19),
    { message: "Número do cartão inválido", path: ["numero_cartao"] }
  )
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      (data.nome_titular && data.nome_titular.trim().length >= 3),
    { message: "Nome do titular é obrigatório", path: ["nome_titular"] }
  )
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      (data.validade &&
        /^\d{2}\/\d{2}$/.test(data.validade) &&
        data.validade.length === 5),
    { message: "Validade deve estar no formato MM/AA", path: ["validade"] }
  )
  .refine(
    (data) => data.pagamento !== "cartao" || (data.cvv && data.cvv.length >= 3),
    { message: "CVV inválido", path: ["cvv"] }
  )
  .refine(
    (data) =>
      data.pagamento !== "cartao" ||
      (data.parcelas && Number(data.parcelas) >= 1),
    { message: "Selecione o número de parcelas", path: ["parcelas"] }
  );

const STEP_FIELDS = {
  cliente: ["nome_cliente", "email"],
  endereco: [
    "cep",
    "endereco",
    "numero_casa",
    "bairro",
    "cidade",
    "estado",
  ] as const,
  entrega: ["frete_opcao"],
  pagamento: [
    "pagamento",
    "numero_cartao",
    "nome_titular",
    "validade",
    "cvv",
    "parcelas",
  ],
} as const;

type TStep = keyof typeof STEP_FIELDS;
type TForm = z.infer<typeof formSchema>;

export const AccordionForm = () => {
  const { user } = useUser();
  const { items } = useCart();
  const [activeStep, setActiveStep] = useState<TStep>("cliente");
  const [completedSteps, setCompletedSteps] = useState<TStep[]>([]);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    cep: cepFromStore,
    shippingOptions,
    selectedShipping,
    isFreeShipping,
    setShippingOptions,
    setSelectedShipping,
  } = useShippingStore();

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

  const { control, setValue, watch, trigger, handleSubmit } = form;

  // Preenche email do usuário
  useEffect(() => {
    if (user?.email) setValue("email", user.email);
  }, [user, setValue]);

  // Preenche CEP do carrinho
  useEffect(() => {
    if (cepFromStore.length === 8) {
      const formatted = cepFromStore.replace(/(\d{5})(\d{3})/, "$1-$2");
      setValue("cep", formatted);
      fetchAddressByCep(formatted);
    }
  }, [cepFromStore, setValue]);

  // Preenche opção de frete
  useEffect(() => {
    if (selectedShipping?.id) {
      setValue("frete_opcao", selectedShipping.id, { shouldValidate: true });
    }
  }, [selectedShipping, setValue]);

  // Limpa campos do cartão quando muda método de pagamento
  useEffect(() => {
    const method = watch("pagamento");
    if (method !== "cartao") {
      setValue("numero_cartao", "", { shouldValidate: true });
      setValue("nome_titular", "", { shouldValidate: true });
      setValue("validade", "", { shouldValidate: true });
      setValue("cvv", "", { shouldValidate: true });
      setValue("parcelas", "1", { shouldValidate: true });
    }
  }, [watch("pagamento"), setValue]);

  const fetchAddressByCep = async (cep: string) => {
    if (cep.length < 9) return;
    const cleaned = cep.replace(/\D/g, "");
    setIsFetchingCep(true);

    const response = await getViaCep(cleaned);
    setIsFetchingCep(false);

    const states = getEstadoPorUF(response.uf);

    if (response) {
      setValue("endereco", response.logradouro);
      setValue("bairro", response.bairro);
      setValue("cidade", response.localidade);
      setValue("estado", response.estado ?? states);
      setValue("complemento", response.complemento || "");
    }
  };

  const calculateShipping = async (cepValue: string) => {
    const cleaned = cepValue.replace(/\D/g, "");
    if (cleaned.length !== 8) return;

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      const payload = {
        cep_destino: cleaned,
        peso_gramas: items[0]?.weight || 500,
        largura_cm: items[0]?.width || 16,
        altura_cm: items[0]?.height || 6,
        comprimento_cm: items[0]?.length || 23,
        valor_declarado: items[0]?.unit_price || 0,
        cep_origem: "13454183",
      };

      const options: ShippingOption[] = (await getShippingPrice(payload)).data;

      if (options.length === 0) {
        setShippingError("Nenhuma opção de entrega disponível para este CEP");
        setShippingOptions([]);
        setSelectedShipping(null);
      } else {
        setShippingOptions(options);
        const cheapest = options.reduce((prev, curr) =>
          curr.preco < prev.preco ? curr : prev
        );
        setSelectedShipping(cheapest);
        setValue("frete_opcao", cheapest.id, { shouldValidate: true });
      }
    } catch (err) {
      setShippingError("Erro ao calcular frete. Tente novamente.");
      setShippingOptions([]);
      setSelectedShipping(null);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  useEffect(() => {
    const cepValue = watch("cep");
    const cleaned = cepValue?.replace(/\D/g, "") || "";

    if (
      cleaned.length === 8 &&
      shippingOptions.length === 0 &&
      cepFromStore !== cleaned
    ) {
      calculateShipping(cepValue);
    }
  }, [watch("cep"), shippingOptions.length, cepFromStore]);

  const isStepValid = (step: TStep): boolean => {
    const fields = STEP_FIELDS[step];
    return fields.every(
      (field) => !form.formState.errors[field as keyof TForm]
    );
  };

  const validateStep = async (step: TStep) => {
    const fields = STEP_FIELDS[step];
    const isValid = await trigger(fields);
    if (isValid) {
      setCompletedSteps((prev) =>
        prev.includes(step) ? prev : [...prev, step]
      );
    }
    return isValid;
  };

  const goToNextStep = async (current: TStep, next: TStep) => {
    const isValid = await validateStep(current);
    if (isValid) setActiveStep(next);
  };

  const canOpenStep = (step: TStep) =>
    step === activeStep || completedSteps.includes(step);

  const onSubmit = async (data: TForm) => {
    setIsSubmitting(true);
    try {
      // Aqui você integra com o gateway de pagamento
      console.log("Dados do pedido:", data);
      // Exemplo: await processPayment(data);
      alert("Pagamento processado com sucesso! (simulado)");
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-white"
      value={activeStep}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* CLIENTE */}
          <AccordionItem value="cliente">
            <AccordionTrigger
              onClick={(e) => {
                if (!canOpenStep("cliente")) e.preventDefault();
                setActiveStep("cliente");
              }}
            >
              Dados do Cliente
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 px-5">
              <InputForm
                name="nome_cliente"
                control={control}
                label="Nome"
                required
              />
              <InputForm
                name="email"
                control={control}
                label="Email"
                required
              />
              <CelularInputForm
                name="celular"
                control={control}
                label="Celular (opcional)"
              />
              <NewButton
                label="Prosseguir"
                icon={<CircleArrowRight />}
                onClick={() => goToNextStep("cliente", "endereco")}
                disabled={!isStepValid("cliente")}
                className={cn(
                  "w-1/3 self-end",
                  isStepValid("cliente") &&
                    "bg-green-400 text-white hover:bg-green-500"
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ENDEREÇO */}
          <AccordionItem value="endereco">
            <AccordionTrigger
              onClick={(e) => {
                if (!canOpenStep("endereco")) e.preventDefault();
                setActiveStep("endereco");
              }}
            >
              Detalhes da Entrega
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-5 px-5">
              <CepInputForm
                name="cep"
                control={control}
                label="CEP"
                required
                onChangeValue={fetchAddressByCep}
                disabled={isFetchingCep}
              />
              <div className="flex gap-4">
                <InputForm
                  name="endereco"
                  control={control}
                  label="Rua/Endereço"
                  required
                  className="flex-1"
                  disabled={isFetchingCep}
                />
                <InputForm
                  name="numero_casa"
                  control={control}
                  label="Nº"
                  required
                  className="w-32"
                  disabled={isFetchingCep}
                />
              </div>
              <InputForm
                name="complemento"
                control={control}
                label="Complemento (opcional)"
                disabled={isFetchingCep}
              />
              <InputForm
                name="bairro"
                control={control}
                label="Bairro"
                required
                disabled={isFetchingCep}
              />
              <InputForm
                name="cidade"
                control={control}
                label="Cidade"
                required
                disabled={isFetchingCep}
              />
              <InputForm
                name="estado"
                control={control}
                label="Estado"
                required
                disabled={isFetchingCep}
              />
              <NewButton
                label="Prosseguir"
                icon={<CircleArrowRight />}
                onClick={() => goToNextStep("endereco", "entrega")}
                disabled={!isStepValid("endereco")}
                className={cn(
                  "w-1/3 self-end",
                  isStepValid("endereco") &&
                    "bg-green-400 text-white hover:bg-green-500"
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* ENTREGA */}
          <AccordionItem value="entrega">
            <AccordionTrigger
              onClick={(e) => {
                if (!canOpenStep("entrega")) e.preventDefault();
                setActiveStep("entrega");
              }}
            >
              Método de Entrega
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
              {isFreeShipping ? (
                <div className="p-6 bg-green-50 border border-green-300 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-800">
                    Frete Grátis! 🎉
                  </p>
                  <p className="text-green-700 mt-2">
                    Sua compra acima de R$250 ganhou entrega gratuita
                  </p>
                </div>
              ) : isCalculatingShipping ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                  <p className="mt-4 text-gray-600">
                    Calculando opções de entrega...
                  </p>
                </div>
              ) : shippingOptions.length > 0 ? (
                <RadioGroup
                  value={watch("frete_opcao")}
                  onValueChange={(value) => {
                    setValue("frete_opcao", value, { shouldValidate: true });
                    const option = shippingOptions.find((o) => o.id === value);
                    if (option) setSelectedShipping(option);
                  }}
                >
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all",
                          watch("frete_opcao") === option.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={option.id} />
                          <div>
                            <p className="font-medium">
                              {option.nome} - {option.empresa}
                            </p>
                            <p className="text-sm text-gray-600">
                              Entrega em até {option.prazo_dias} dias úteis
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-lg">
                          R$ {option.preco.toFixed(2).replace(".", ",")}
                        </span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-8 text-orange-600">
                  <p className="font-medium">
                    Não foi possível calcular o frete
                  </p>
                  <p className="text-sm mt-2">
                    {shippingError || "Verifique seu CEP e tente novamente."}
                  </p>
                </div>
              )}

              <NewButton
                label="Ir para Pagamento"
                icon={<CircleArrowRight />}
                onClick={() => goToNextStep("entrega", "pagamento")}
                disabled={
                  !isFreeShipping &&
                  (isCalculatingShipping ||
                    shippingOptions.length === 0 ||
                    !watch("frete_opcao"))
                }
                className={cn(
                  "w-1/3 self-end",
                  (isFreeShipping ||
                    (shippingOptions.length > 0 && watch("frete_opcao"))) &&
                    "bg-green-400 text-white hover:bg-green-500"
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* PAGAMENTO */}
          <AccordionItem value="pagamento">
            <AccordionTrigger
              onClick={(e) => {
                if (!canOpenStep("pagamento")) e.preventDefault();
                setActiveStep("pagamento");
              }}
            >
              Forma de Pagamento
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
              <RadioGroup
                value={watch("pagamento") ?? ""}
                onValueChange={(value) => {
                  setValue("pagamento", value as "pix" | "cartao" | "boleto", {
                    shouldValidate: true,
                  });
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PIX */}
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                      watch("pagamento") === "pix"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <RadioGroupItem value="pix" className="sr-only" />
                    <div className="text-4xl mb-3">📱</div>
                    <div className="font-semibold text-lg">Pix</div>
                    <p className="text-sm text-gray-600 mt-1">
                      À vista - pagamento instantâneo
                    </p>
                  </label>

                  {/* CARTÃO */}
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                      watch("pagamento") === "cartao"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <RadioGroupItem value="cartao" className="sr-only" />
                    <div className="text-4xl mb-3">💳</div>
                    <div className="font-semibold text-lg">
                      Cartão de Crédito
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Até 12x sem juros
                    </p>
                  </label>

                  {/* BOLETO */}
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all text-center",
                      watch("pagamento") === "boleto"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60"
                    )}
                  >
                    <RadioGroupItem value="boleto" className="sr-only" />
                    <div className="text-4xl mb-3">📄</div>
                    <div className="font-semibold text-lg">Boleto</div>
                    <p className="text-sm text-gray-600 mt-1">
                      À vista - compensação em 1-3 dias
                    </p>
                  </label>
                </div>
              </RadioGroup>

              {/* Formulário do cartão */}
              {watch("pagamento") === "cartao" && (
                <div className="mt-6 space-y-5 bg-gray-50 p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputForm
                      name="numero_cartao"
                      control={control}
                      label="Número do Cartão"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    <InputForm
                      name="nome_titular"
                      control={control}
                      label="Nome do Titular"
                      placeholder="Como está no cartão"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InputForm
                      name="validade"
                      control={control}
                      label="Validade"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                    <InputForm
                      name="cvv"
                      control={control}
                      label="CVV"
                      placeholder="123"
                      maxLength={4}
                      type="password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Parcelamento
                    </label>
                    <select
                      className="w-full border rounded-md p-3"
                      value={watch("parcelas") ?? "1"}
                      onChange={(e) => setValue("parcelas", e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de R$ {/* total / n */ (100).toFixed(2)}
                          {n > 1 ? " sem juros" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Resumo e finalizar */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between text-lg font-medium mb-4">
                  <span>Total a pagar:</span>
                  <span className="text-green-700">
                    R$ {/* totalComFrete.toFixed(2) */ "0,00"}
                  </span>
                </div>

                <NewButton
                  label={
                    watch("pagamento") === "pix"
                      ? "Gerar Pix"
                      : watch("pagamento") === "boleto"
                        ? "Gerar Boleto"
                        : "Finalizar Compra"
                  }
                  icon={<CircleArrowRight />}
                  disabled={!watch("pagamento") || isSubmitting}
                  className="w-full py-7 text-lg bg-green-600 hover:bg-green-700"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </form>
      </Form>
    </Accordion>
  );
};
