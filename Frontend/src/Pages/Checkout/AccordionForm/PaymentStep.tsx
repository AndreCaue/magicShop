import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NewButton } from "@/components/new/NewButton";
import { CircleArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { CardPayment } from "../Components/CardPayment";
import { PaymentMethodSelector } from "../Components/PaymentMethodSelector";
import { useCart } from "@/Hooks/useCart";
import { useShippingStore } from "@/stores/useShippingStore";
import { paymentCard } from "@/Repositories/payment/payment";
import EfiPay from "payment-token-efi";
import { detectCardBrand } from "../utils";

const ACCOUNT_EFI_ID = import.meta.env.VITE_EFI_ACCOUNTID;

type Props = {
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
  navigateToSteps: (
    current: TStep,
    next: TStep,
    previous?: boolean,
  ) => Promise<void>;
};

export default function PaymentStep({
  canOpenStep,
  form,
  navigateToSteps,
}: Props) {
  const {
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
    getValues,
  } = form;

  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const { subtotal, discount, items } = useCart();
  const { selectedShipping } = useShippingStore();
  const selectedMethod = watch("pagamento");

  useEffect(() => {
    if (selectedMethod !== "cartao") {
      setValue("numero_cartao", "", { shouldValidate: true });
      setValue("nome_titular", "", { shouldValidate: true });
      setValue("validade", "", { shouldValidate: true });
      setValue("cvv", "", { shouldValidate: true });
      setValue("parcelas", "1", { shouldValidate: true });
    }
  }, [selectedMethod, setValue]);

  const isStepValid = () => {
    if (!selectedMethod) return false;

    if (selectedMethod === "cartao") {
      const requiredFields = {
        numero_cartao: watch("numero_cartao"),
        nome_titular: watch("nome_titular"),
        validade: watch("validade"),
        cvv: watch("cvv"),
        parcelas: watch("parcelas"),
      };

      // Todos os campos devem estar preenchidos e sem erros
      return Object.entries(requiredFields).every(([key, value]) => {
        return value?.toString().trim() !== "" && !errors[key as keyof TForm];
      });
    }

    return true;
  };

  const generateToken = async () => {
    if (selectedMethod !== "cartao") return null; // pode pagar

    setIsTokenizing(true);
    setTokenError(null);

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
      setTokenError("Preencha todos os dados do cartão");
      setIsTokenizing(false);
      return null;
    }

    try {
      const tokenData = await EfiPay.CreditCard.setEnvironment("sandbox")
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
          holderDocument: "82566214000", // verificar se
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
      setTokenError(msg);
      setError("numero_cartao", { message: msg });
      return null;
    } finally {
      setIsTokenizing(false);
    }
  };

  const generalDiscount = () => {
    if (!selectedShipping) return 0;

    const hasFreeShipping = Number(discount) >= Number(selectedShipping.preco);
    if (hasFreeShipping) return 0;

    const shippingWithDiscount =
      Number(selectedShipping.preco) - Number(discount);
    return Math.round(shippingWithDiscount * 100); // centavos
  };

  const onSubmit = async () => {
    const data = getValues();

    if (data.pagamento === "cartao") {
      const token = await generateToken();
      if (!token) return;

      const clearCpf = getValues("cpf").replaceAll(".", "").replace("-", "");
      const shippingCost = generalDiscount();

      const payload = {
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity || 1,
          // unit_price: Math.round(item.unit_price * 100),
        })),
        shipping:
          shippingCost > 0
            ? {
                name: selectedShipping?.nome || "Frete",
                value: shippingCost,
              }
            : null,
        payment_token: token,
        installments: Number(getValues("parcelas") || 1),
        customer: {
          name: getValues("nome_cliente"),
          email: getValues("email"),
          cpf: clearCpf,
          phone_number: getValues("celular"),
        },
        billing_address: {
          street: getValues("endereco"),
          number: getValues("numero_casa"),
          neighborhood: getValues("bairro"),
          city: getValues("cidade"),
          state: getValues("uf"),
          zipcode: getValues("cep"),
        },
      };

      try {
        const res = await paymentCard(payload);
        console.log(res, "res");
      } catch (err) {
        setTokenError("Não foi possível processar o pagamento.");
        return;
      }

      // Opcional: force revalidação
      await form.trigger();
      if (!form.formState.isValid) return;
    }

    // ... continue com fetch /api/checkout/finalizar
  };

  const getTotal = () => {
    if (!selectedShipping) return;
    if (Number(discount) >= selectedShipping.preco) return Number(subtotal);
    const value =
      Number(subtotal) + (selectedShipping?.preco - Number(discount));

    return Number(value.toFixed(2));
  };

  const getButtonLabel = () => {
    switch (selectedMethod) {
      case "pix":
        return "Gerar Pix";
      case "cartao":
        return "Finalizar Compra";
      default:
        return "Selecione uma forma de pagamento";
    }
  };

  const handlePrevious = async () => {
    await navigateToSteps("pagamento", "entrega", true);
  };

  return (
    <AccordionItem value="pagamento">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("pagamento")) {
            e.preventDefault();
          }
        }}
      >
        Forma de Pagamento
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
        <button type="button" onClick={() => handlePrevious()}>
          Retroceder
        </button>
        <PaymentMethodSelector selectedMethod={selectedMethod} form={form} />

        <CardPayment
          form={form}
          selectedMethod={selectedMethod}
          valorTotal={getTotal()}
        />
        <div className="mt-8 pt-6 border-t">
          <div className="flex justify-between items-center text-lg font-medium mb-6">
            <span>Total a pagar:</span>
            <span className="text-green-700 text-2xl">R$ {getTotal()}</span>
          </div>

          <NewButton
            label={getButtonLabel()}
            icon={<CircleArrowRight />}
            onClick={onSubmit}
            disabled={
              !isStepValid() || isSubmitting || isTokenizing || !tokenError
            }
            typeB="button"
            className={cn(
              "w-full py-7 text-lg",
              isStepValid()
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed",
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
