import { CheckboxForm } from "@/components/new/Checkbox";
import { DropdownForm } from "@/components/new/DropdownForm";
import { NewButton } from "@/components/new/NewButton";
import { TextAreaForm } from "@/components/new/TextAreaForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import type { TGetUserOrderList } from "@/Repositories/payment/orders";
import { getRefundReasons } from "@/Repositories/shop/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type TDialogRefund = {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  order?: TGetUserOrderList;
};

const formSchema = z.object({
  reason_code: z.number(),
  confirm: z.number(),
});

export const DialogRefund = ({ isOpen, setOpen, order }: TDialogRefund) => {
  const [isLoading, setLoading] = useState(false);

  type TForm = z.infer<typeof formSchema>;

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
    watch,
  } = form;

  const onSubmit = async () => {
    if (!order || !refundReasons) return;
    setLoading(true);
    const { reason_code } = form.getValues();
    const refundReasonEmail = refundReasons.filter(
      (r) => r.id === reason_code,
    )[0].text;
    const time = new Date();
    const body = `
      Pedido: ${order?.short_id}
      CPF: >>>Preencha aqui<<< Somente em caso de troca.
      Motivo: ${refundReasonEmail}

      Em caso de produtos danificados ou avariados recomendamos mandar a foto no anexo do email para agilizar o processo.

      Solicitação criada ás: ${format(time, "dd/MM/yyyy HH:mm", { locale: ptBR })}
    `;
    const mailtoLink = `mailto:lojamagica@doceilusao.store?subject=${encodeURIComponent("Solicitação de Devolução")}&body=${encodeURIComponent(`${body}`)}`;

    window.location.href = mailtoLink;
    setLoading(false);
  };

  const { data: refundReasons, isLoading: reasonsLoading } = useQuery({
    queryKey: ["refundReasons"],
    queryFn: getRefundReasons,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="flex flex-col bg-transparent text-white min-w-fit text-sm"
      >
        <DialogTitle className="text-2xl">
          Solicitar Devolução / Reembolso
        </DialogTitle>
        <div className="flex flex-col gap-2">
          <div className="max-h-[300px] lg:max-h-[400px] overflow-auto scroll-auto">
            <h1 className="font-bold text-lg my-2">
              Desistência/Arrependimento
            </h1>
            <span>
              Ressaltamos que o prazo para <b>desistir</b> da compra do produto
              é de até 7 (sete) dias corridos, a contar da data do recebimento.
              o reembolso ou troca serão realizados no valor total do(s)
              produto(s) devolvido(s), utilizando a mesma forma de pagamento
              escolhida no processo de compra.
              <br />
              <b>Cartão de crédito:</b>
              solicitação de estorno realizada, dentro de até 10 dias úteis (*),
              junto a administradora do cartão, lembrando que o prazo de
              reembolso é o estipulado pela própria operadora do cartão;
              <br />
              (*) o prazo de estorno/reembolso passa a contar a partir do
              processamento de verificação de nossa loja, que tem até 3 (três)
              dias úteis a partir do seu recebimento.
            </span>
          </div>

          <Separator className="my-4" />

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-5">
                <span>Para solicitar a devolução envie um email:</span>

                <DropdownForm
                  control={control}
                  name="reason_code"
                  className="text-white"
                  required
                  label="Selecione o motivo da devolução:"
                  hideCommand
                  disabled={reasonsLoading || isLoading}
                  options={
                    refundReasons?.map((reason) => ({
                      text: reason.text,
                      value: reason.id,
                    })) ?? []
                  }
                />

                {watch("reason_code") === 7 && (
                  <TextAreaForm
                    name="description"
                    label="Descreva o motivo (OPCIONAL)"
                    background="dark"
                    disabled={isLoading}
                  />
                )}
              </div>

              <NewButton
                label="Enviar email"
                className="mt-5"
                disabled={!watch("confirm") || isSubmitting}
              />
              <CheckboxForm
                name="confirm"
                control={control}
                className="mt-2"
                options={[
                  {
                    text: "Confirmo que a loja poderá entrar em contato para auxiliar em caso de problemas!.",
                    value: 1,
                  },
                ]}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
