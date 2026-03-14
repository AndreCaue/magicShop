import { NewButton } from "@/components/new/NewButton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import Contador from "./Components/Contador";
import { useNavigate } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import type { TGetOrderIfHas } from "@/Repositories/payment/orders";

type THasOrderDialog = {
  data: TGetOrderIfHas;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const HasOrderDialog = ({ data, isOpen, setOpen }: THasOrderDialog) => {
  const navigate = useNavigate();

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger className="flex w-full justify-center">
          <span className="underline text-white cursor-pointer">Pedido</span>
        </DialogTrigger>
        <DialogContent className="flex flex-col justify-center items-center rounded-2xl w-full bg-black/60 px-10 py-5 gap-4 text-white shadow-2xl">
          <AlertTriangle size={40} />

          <div className="flex flex-col gap-4">
            <span className="">Possui um pedido em aberto.</span>
            <span className="">{data.message}</span>
            <span>
              Se já realizou o pagamento aguarde a confirmação do pagamento.
            </span>

            <span>Se ainda não realizou, e deseja pagar:</span>
          </div>

          <NewButton
            label="Clique Aqui"
            onClick={() => navigate(data.redirect)}
            className="w-44 h-10"
          />
        </DialogContent>
      </Dialog>

      {data?.expires_at && (
        <Contador
          initialSeconds={data?.expires_at}
          onExpire={() => navigate("/")}
          bottomLabel="Sempre poderá fazer um novo pedido ao final da contagem."
          className="text-white mt-5"
          topLabel="Seu pedido será fechado em:"
        />
      )}
    </div>
  );
};
