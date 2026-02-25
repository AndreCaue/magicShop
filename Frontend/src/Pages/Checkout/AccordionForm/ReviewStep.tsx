import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { type TStep, type TForm } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { useShippingStore } from "@/stores/useShippingStore";
import { useCart } from "@/Hooks/useCart";
import { ReviewTitle } from "./ReviewComponents/ReviewTitle";
import { ItemsSection } from "./ReviewComponents/ItemsSection";
import { ShippingSection } from "./ReviewComponents/ShippingSection";
import { OrderSummary } from "./ReviewComponents/OrderSummary";
import { CircleArrowLeft } from "lucide-react";
import { NewButton } from "@/components/new/NewButton";
import { createOrderCheckout } from "@/Repositories/shop/cart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type Props = {
  canOpenStep: (step: TStep) => boolean;
  form: UseFormReturn<TForm>;
  navigateToSteps: (
    current: TStep,
    next: TStep,
    previous?: boolean,
  ) => Promise<void>;
};

export default function OrderReview({
  canOpenStep,
  form,
  navigateToSteps,
}: Props) {
  const { getValues } = form;

  const { items, subtotal, discount } = useCart();
  const { selectedShipping } = useShippingStore();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const {
      bairro,
      celular,
      cep,
      cidade,
      cpf,
      email,
      nome_cliente,
      numero_casa,
      frete_opcao,
      uf,
      complemento,
      endereco,
    } = getValues();

    const clearCpf = cpf.replaceAll(".", "").replace("-", "");
    const clearCep = cep.replace("-", "");

    const res = await createOrderCheckout({
      city: cidade,
      complement: complemento,
      neighborhood: bairro,
      number: numero_casa,
      postal_code: clearCep,
      recipient_document: clearCpf,
      recipient_email: email,
      recipient_name: nome_cliente,
      recipient_phone: celular,
      shipping_option_id: frete_opcao,
      state: uf,
      street: endereco,
    });

    toast.success(res.message);
    navigate(res.redirect);
  };

  const onClickPrevious = async () => {
    await navigateToSteps("revisao", "entrega", true);
  };

  const {
    nome_cliente,
    email,
    celular,
    endereco,
    complemento,
    uf,
    cidade,
    bairro,
    numero_casa,
    cep,
  } = getValues();

  return (
    <AccordionItem value="revisao">
      <AccordionTrigger
        onClick={(e) => {
          if (!canOpenStep("revisao")) {
            e.preventDefault();
          }
        }}
      >
        Revisão de Dados e Pedido
      </AccordionTrigger>

      <AccordionContent className="flex flex-col gap-6 px-5 pb-8">
        <NewButton
          onClick={onClickPrevious}
          variant={"reject"}
          label="Voltar/Editar"
          className="w-44 py-1"
          icon={<CircleArrowLeft />}
        />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <ReviewTitle
            title="Revisão do Pedido"
            subTitle="Confirme todas as informações antes de finalizar a compra"
          />

          <div className="divide-y divide-gray-100">
            <ItemsSection items={items} />

            <ShippingSection
              customer={{ nome_cliente, email, celular }}
              address={{
                endereco,
                complemento,
                cidade,
                uf,
                bairro,
                cep,
                numero_casa,
              }}
              shipping={selectedShipping}
            />
          </div>

          <OrderSummary
            discount={discount}
            selectedShipping={selectedShipping}
            subtotal={subtotal}
          />

          <div className="px-6 py-6 border-t border-gray-100 bg-white">
            <NewButton
              onClick={handleCheckout}
              typeB="button"
              variant="proceed"
              label={`
              Criar ordem - Ir para o Pagamento
              `}
            ></NewButton>

            <p className="mt-4 text-center text-xs text-gray-500">
              Ao confirmar, você concorda com nossos termos e política de
              privacidade
            </p>
          </div>
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
}
