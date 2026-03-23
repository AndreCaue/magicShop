import { motion } from "framer-motion";
import type { TGetUserOrderList } from "@/Repositories/payment/orders";
import { ExternalLink, Info, Package, RefreshCcw } from "lucide-react";
import { NewTooltip } from "@/components/new/Tooltip";

export const ExpandedRow = ({
  order,
  onClickOpen,
}: {
  order: TGetUserOrderList;
  onClickOpen: (orderShortId: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-white/5 bg-black/20 px-6 py-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-xs tracking-widest text-white/30">
              ITENS DO PEDIDO
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    <span className="text-sm text-white/70">{item.name}</span>
                    <span className="font-mono text-xs text-white/30">
                      ×{item.qty}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-white/60">
                    R$ {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-3 font-mono text-xs tracking-widest text-white/30">
                AÇÕES
              </p>
              <div className="flex flex-wrap gap-2">
                {order.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() => onClickOpen(order.short_id)}
                    className="flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-mono text-violet-300 transition-colors hover:bg-violet-400/20 cursor-pointer"
                  >
                    <RefreshCcw size={11} />
                    Solicitar Devolução/Reembolso
                    <NewTooltip
                      icon={<Info size={16} />}
                      textContent="Solicitação de Reembolso passa pela análise, somente após aprovação o processo de estorno será iniciado."
                      // link="politics" #Parei aqui, fazer feature
                    />
                  </button>
                )}
                {order.status === "shipped" && (
                  <button className="flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-mono text-sky-300 transition-colors hover:bg-sky-400/20">
                    <ExternalLink size={11} />
                    Rastrear
                  </button>
                )}
                <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/50 transition-colors hover:bg-white/10 hover:text-white/80">
                  <Package size={11} />
                  Ver +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
