import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, Loader2, QrCode } from "lucide-react";
import { useState, type Dispatch } from "react";
import type { IPaymentMethod } from "../../CheckoutPayment";
import { SmokeButton } from "@/components/new/SmokeButton";
import type { IPixDataResponse } from "@/Repositories/payment/payment";
import QRCode from "react-qr-code";

type TPixPayment = {
  isPix: boolean;
  total: number;
  setActiveMethod: Dispatch<React.SetStateAction<IPaymentMethod>>;
  isModalOpen: boolean;
  loading?: boolean;
  setModalOpen: Dispatch<React.SetStateAction<boolean>>;
  pixCopyPaste: string;
  data?: IPixDataResponse;
};

export const PixPayment = ({
  isModalOpen,
  isPix,
  setActiveMethod,
  setModalOpen,
  total,
  loading,
  data,
}: TPixPayment) => {
  const [pixCopied, setPixCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(
      data?.pix_copia_e_cola || "Chave pix não encontrada",
    );
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2200);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`
              flex-1 flex flex-col relative
              p-5 sm:p-6 md:p-8 lg:p-9
              ${isPix ? "bg-gradient-to-b from-emerald-950/30 to-transparent" : ""}
              transition-all duration-700
            `}
      >
        <div className="hidden md:flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${isPix ? "bg-emerald-600/30" : "bg-gray-700/40"}`}
          >
            <QrCode className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">PIX</h2>
        </div>

        <AnimatePresence mode="wait">
          {isPix ? (
            <motion.div
              key="pix"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 py-4 md:py-0"
            >
              <div className="bg-white/5 p-5 sm:p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md w-full max-w-[300px] sm:max-w-[340px] aspect-square flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-gradient-to-br from-emerald-400/10 to-emerald-700/10 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    {data?.imagem_qrcode ? (
                      <img
                        src={data.imagem_qrcode || "Chave pix não encontrada"}
                        alt="Imagem do pix"
                      />
                    ) : (
                      <QRCode
                        value={
                          data?.pix_copia_e_cola || "Chave pix não encontrada"
                        }
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-300">
                    Escaneie com o app do seu banco
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md space-y-5 px-2 sm:px-0">
                <div className="bg-black/30 p-4 sm:p-5 rounded-xl border border-gray-600">
                  <p className="text-sm text-gray-400 mb-2">Chave PIX</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm sm:text-base font-mono break-all">
                      {data?.pix_copia_e_cola}
                    </code>
                    <button
                      onClick={handleCopyPix}
                      className="shrink-0 p-2 hover:bg-gray-700/60 rounded-lg transition-all"
                    >
                      {pixCopied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <SmokeButton
                  textLabel="Detalhes do pedido"
                  isActive={isModalOpen}
                  onClick={() => setModalOpen(true)}
                  spanStyle="text-white"
                  className="mx-auto"
                />

                <div className="text-center text-xl sm:text-2xl font-semibold text-emerald-400">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Pagar R$ ${total?.toFixed(2).replace(".", ",") || ""}`
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="pix-inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMethod("pix")}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all"
            >
              <span className="text-xl font-bold opacity-80 group-hover:opacity-100">
                Selecionar PIX
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
};
