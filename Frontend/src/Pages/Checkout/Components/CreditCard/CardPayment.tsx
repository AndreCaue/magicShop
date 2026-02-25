import {
  getInstallments,
  paymentCard,
  type TInstallment,
} from "@/Repositories/payment/payment";
import { detectCardBrand } from "../../utils";
import { useState, type Dispatch } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Loader2 } from "lucide-react";
import { InputForm } from "@/components/new/InputForm";
import { InputCardForm } from "@/components/new/InputCardForm";
import { Form } from "@/components/ui/form";
import { DropdownForm } from "@/components/new/DropdownForm";
import type { IDropdownOption } from "@/helpers/generics";
import type { IPaymentMethod } from "../../CheckoutPayment";
import { SmokeButton } from "@/components/new/SmokeButton";
import type { IOrderResponse } from "../../types";
import EfiPay from "payment-token-efi";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ValidateCardInput } from "@/components/new/ValidateCardInput";
const ACCOUNT_EFI_ID = import.meta.env.VITE_EFI_ACCOUNTID;
const ENV = import.meta.env.VITE_ENVIRONMENT;

const formSchema = z
  .object({
    numero_cartao: z.string().optional(),
    nome_titular: z.string().optional(),
    validade: z.string().optional(),
    cvv: z.string().optional(),
    parcelas: z.number().optional(),
    payment_token: z.string(),
  })
  .refine((data) => !!data.numero_cartao?.replace(/\D/g, "").length, {
    message: "Número do cartão inválido",
    path: ["numero_cartao"],
  })
  .refine(
    (data) => {
      const name = data.nome_titular?.trim() ?? "";

      if (name.length < 5) return false;

      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) return false;

      const parts = name.split(/\s+/);
      if (parts.length < 2) return false;

      const allSameLetters = parts.every(
        (p) => new Set(p.toLowerCase()).size === 1,
      );
      if (allSameLetters) return false;

      return true;
    },
    {
      message: "Informe o nome completo como está no cartão",
      path: ["nome_titular"],
    },
  )
  .refine(
    (data) => {
      const value = data.validade ?? "";
      if (!/^\d{2}\/\d{2}$/.test(value)) return false;

      const [monthStr, yearStr] = value.split("/");
      const month = Number(monthStr);
      const year = Number(yearStr);

      if (month < 1 || month > 12) return false;

      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;

      if (year > currentYear + 20) return false;

      return true;
    },
    {
      message: "Data de validade do cartão inválida",
      path: ["validade"],
    },
  )
  .refine((data) => (data.cvv?.length ?? 0) >= 3, {
    message: "CVV inválido",
    path: ["cvv"],
  })
  .refine((data) => Number(data.parcelas) >= 1, {
    message: "Selecione o número de parcelas",
    path: ["parcelas"],
  });

type TCardPayment = {
  isPix: boolean;
  setActiveMethod: Dispatch<React.SetStateAction<IPaymentMethod>>;
  isModalOpen: boolean;
  setModalOpen: Dispatch<React.SetStateAction<boolean>>;
  orderData: IOrderResponse | undefined;
};

type TForm = z.infer<typeof formSchema>;

export const CardPayment = ({
  isPix,
  setActiveMethod,
  isModalOpen,
  orderData,
  setModalOpen,
}: TCardPayment) => {
  const [installmentsData, setInstallmentsData] = useState<TInstallment[]>([]);
  const [installmentsList, setInstallmentsList] = useState<IDropdownOption[]>(
    [],
  );
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parcelas: undefined,
      cvv: "",
      nome_titular: "",
      numero_cartao: "",
      payment_token: "",
      validade: "",
    },
  });

  const {
    control,
    getValues,
    setError,
    setValue,
    formState: { isSubmitting },
  } = form;

  const handleGetParcelas = async () => {
    if (installmentsData.length) return;
    if (!orderData) return;

    setLoading(true);

    const cardNumber =
      form.getValues("numero_cartao")?.replace(/\D/g, "") || "";
    const brand = detectCardBrand(cardNumber);

    const res = await getInstallments({ brand, total_value: orderData.total });
    setLoading(false);
    if (!res?.success) return;

    const installmentsToList = res.installments.map((each) => ({
      text: ` ${each.installment}x de R$ ${each.installment_value.toFixed(2)}
${each.has_interest ? `- Juros de R$ ${(each.total_value - orderData.total).toFixed(2)}` : "Sem juros"}`,
      value: each.installment,
    }));

    setInstallmentsData(res.installments);
    setInstallmentsList(installmentsToList);
  };

  const handleClearParcelas = () => {
    setInstallmentsData([]);
    setInstallmentsList([]);
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length < 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const generateToken = async (cpf: string) => {
    const cardNumber = getValues("numero_cartao")?.replace(/\D/g, "") || "";
    const brand = detectCardBrand(cardNumber);
    const [month, year] = (getValues("validade") || "")
      .split("/")
      .map((s) => s.trim());

    if (
      !cardNumber ||
      !month ||
      !year ||
      !getValues("cvv") ||
      !getValues("nome_titular")
    ) {
      return null;
    }

    try {
      const tokenData = await EfiPay.CreditCard.setEnvironment(ENV)
        .setAccount(ACCOUNT_EFI_ID)
        .setCardNumber(cardNumber)
        .setCreditCardData({
          number: cardNumber,
          cvv: getValues("cvv") || "",
          expirationMonth: month.padStart(2, "0"),
          expirationYear: `20${year.padStart(2, "0")}`,
          holderName: getValues("nome_titular") || "",
          reuse: false,
          brand: brand,
          holderDocument: cpf,
        })
        .getPaymentToken();

      if ("payment_token" in tokenData) {
        setValue("payment_token", tokenData.payment_token, {
          shouldValidate: true,
        });
        return tokenData.payment_token;
      }
      throw new Error(
        (tokenData as any).error_description || "Erro desconhecido",
      );
    } catch (err: any) {
      const msg = err.error_description || "Falha na tokenização do cartão";
      setError("numero_cartao", { message: msg });
      return null;
    }
  };

  const onSubmit = async () => {
    if (!orderData) return;

    const token = await generateToken(orderData.user.recipient_document);
    if (!token) return;
    try {
      const res = await paymentCard({
        order_uuid: orderData.id,
        installments: getValues("parcelas") || 1,
        payment_token: token,
        name_on_card:
          getValues("nome_titular") || orderData.shipping.recipient_name,
      });

      if (res.success) {
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return toast(
          "Compra realizada com sucesso. Aguardando confirmação de pagamento.",
        );
      }
    } catch (err: any) {
      console.log(err);

      toast.error(err || err.detail || "Erro inesperado");
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className={`
              flex-1 flex flex-col relative
              p-5 sm:p-6 md:p-8 lg:p-9
              ${!isPix ? "bg-gradient-to-b from-blue-950/25 to-transparent" : ""}
              transition-all duration-700
            `}
      >
        <div className="hidden md:flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${!isPix ? "bg-blue-600/30" : "bg-gray-700/40"}`}
          >
            <CreditCard className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Cartão de Crédito
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {!isPix ? (
            <motion.div
              key="credit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col justify-center gap-6 sm:gap-8 py-4 md:py-0"
            >
              <Form {...form}>
                <form
                  className="space-y-5 w-full max-w-md mx-auto px-2 sm:px-0"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <InputCardForm
                    name="numero_cartao"
                    control={control}
                    label="Número do Cartão"
                    placeholder="1234 5678 9012 3456"
                    background="dark"
                    required
                    disabled={isLoading}
                    onBlur={handleGetParcelas}
                    onChangeValue={(e) => !e && handleClearParcelas()}
                  />
                  <InputForm
                    name="nome_titular"
                    control={control}
                    label="Nome do Titular"
                    background="dark"
                    required
                    disabled={isLoading}
                    restrictInput={/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g}
                    placeholder="Como está no cartão"
                  />

                  <ValidateCardInput
                    name="validade"
                    control={control}
                    label="Validade"
                    placeholder="MM/AA"
                    background="dark"
                    onChangeValue={formatExpiry}
                    required
                    disabled={isLoading}
                  />
                  <InputForm
                    name="cvv"
                    control={control}
                    label="CVV"
                    placeholder="123"
                    maxLength={4}
                    background="dark"
                    restrictInput={/\D/g}
                    required
                    disabled={isLoading}
                    type="password"
                  />
                  <DropdownForm
                    label="Parcelas"
                    name="parcelas"
                    options={installmentsList}
                    control={control}
                    required
                    disabled={isLoading || installmentsList.length === 0}
                    hideCommand
                  />

                  <SmokeButton
                    textLabel="Detalhes do pedido"
                    isActive={isModalOpen}
                    onClick={() => setModalOpen(true)}
                    spanStyle="text-white"
                    className="mx-auto"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      isLoading || !form.watch("parcelas") || isSubmitting
                    }
                    className={`
                      mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                      hover:from-blue-500 hover:to-indigo-500 
                      text-white font-bold py-4 px-8 rounded-xl 
                      shadow-lg shadow-blue-900/40 transition-all 
                      disabled:opacity-60 w-full max-w-md mx-auto
                      flex items-center justify-center gap-3 text-base sm:text-lg
                      disabled:cursor-not-allowed cursor-pointer
                    `}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      `Pagar R$ ${orderData?.total.toFixed(2).replace(".", ",") || ""}`
                    )}
                  </motion.button>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.button
              key="credit-inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMethod("credit")}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all"
            >
              <span className="text-xl font-bold opacity-80">
                Selecionar Cartão
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
};
