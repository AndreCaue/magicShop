import { useEffect, useState } from "react";
import { CreditCard, QrCode } from "lucide-react";
import { CardPayment } from "./Components/CreditCard/CardPayment";
import { PageContainer } from "../Home/Components/PageContainer";
import { getPaymentOrder } from "@/Repositories/payment/orders";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { OrderSummaryModal } from "./Components/OrderSummaryModal";
import type { IOrderResponse } from "./types";
import { PixPayment } from "./Components/Pix/PixPayment";
import {
  createPix,
  type IPixDataResponse,
} from "@/Repositories/payment/payment";
import PixLoader from "./Components/PixLoading";

export type IPaymentMethod = "pix" | "credit";

export const CheckoutPayment = () => {
  const [activeMethod, setActiveMethod] = useState<IPaymentMethod>("credit");
  const { id } = useParams();
  const [isOpen, setOpen] = useState(false);
  // const navigate = useNavigate();
  const [data, setData] = useState<IOrderResponse>();
  const [pixData, setPixData] = useState<IPixDataResponse>();
  const [isPixLoading, setPixLoading] = useState(false);

  console.log(id, "dentro da pagina id?");

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await getPaymentOrder({ order_uuid: id });
        setData(res);
        console.log(res, "resposta order");
      } catch (error: any) {
        toast.warning(`Erro: ${error.detail}.`);
        // navigate("/"); descomentar ao finalizar.
      }
    })();
  }, [id]);

  const isPix = activeMethod === "pix";

  useEffect(() => {
    (async () => {
      if (!isPix || !data || pixData) return;
      try {
        setPixLoading(true);

        const res = await createPix({
          order_uuid: data.id,
        });

        if (!res?.success) return;
        if (res?.message) toast.success(res?.message);

        setPixData(res.data);
      } catch (err: any) {
        toast.error(err.detail as string);
      } finally {
        setPixLoading(false);
      }
    })();
  }, [isPix, pixData]);

  return (
    <PageContainer className="text-white">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="md:hidden mb-6">
          <div className="flex rounded-full bg-gray-800/50 p-1.5 backdrop-blur-sm border border-gray-700/60">
            <button
              onClick={() => setActiveMethod("pix")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full text-sm font-medium transition-all ${
                isPix
                  ? "bg-emerald-600/80 shadow-md text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <QrCode size={18} /> PIX
            </button>
            <button
              onClick={() => setActiveMethod("credit")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full text-sm font-medium transition-all ${
                !isPix
                  ? "bg-blue-600/80 shadow-md text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <CreditCard size={18} /> Cartão
            </button>
          </div>
        </div>

        <div
          className={`
            rounded-2xl overflow-hidden
            shadow-2xl border border-gray-700/50
            backdrop-blur-sm bg-black/20
            flex flex-col md:flex-row
            w-full md:w-[850px] h-auto md:h-min-[690px]
            
          `}
        >
          {isPixLoading ? (
            <div className="min-w-[425px] h-[690px] justify-center flex">
              <PixLoader />
            </div>
          ) : (
            <PixPayment
              isModalOpen={isOpen}
              isPix={isPix}
              total={data?.total}
              setActiveMethod={setActiveMethod}
              loading={isPixLoading}
              data={pixData}
              setModalOpen={setOpen}
            />
          )}

          <CardPayment
            isPix={isPix}
            setActiveMethod={setActiveMethod}
            isModalOpen={isOpen}
            orderData={data}
            setModalOpen={setOpen}
          />
        </div>
      </div>

      <OrderSummaryModal isOpen={isOpen} data={data} setOpen={setOpen} />
    </PageContainer>
  );
};
