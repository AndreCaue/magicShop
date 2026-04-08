import { motion } from "framer-motion";
import {
  ExternalLink,
  Info,
  Package,
  RefreshCcw,
  Truck,
  MapPin,
} from "lucide-react";

import { NewTooltip } from "@/components/new/Tooltip";
import type { TAdminOrder } from "@/Repositories/admin";
import { AdminOrderDetailsModal } from "./AdminOrderDetail";
import { useState } from "react";

type Props = {
  order: TAdminOrder;
  onClickOpen?: (orderShortId: string) => void;
  onGenerateShipment?: (orderId: string) => void;
  onBuyLabel?: (shipmentId: string) => void;
};

export const ExpandedRow = ({
  order,
  onClickOpen,
  onGenerateShipment,
  onBuyLabel,
}: Props) => {
  const shipping = order.shipping;
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-white/5 bg-black/20 px-6 py-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 divide-x  divide-white/5  ">
          <div>
            <p className="mb-3 font-mono text-xs tracking-widest text-white/30">
              PRODUTOS
            </p>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/30" />

                    <span className="text-sm text-white/80">{item.name}</span>

                    <span className="font-mono text-xs text-white/40">
                      ×{item.qty}
                    </span>
                  </div>

                  <span className="font-mono text-sm text-white/70">
                    R$ {item.unit_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-white/30">
              <MapPin size={12} />
              ENTREGA
            </p>

            <div className="rounded-lyg bg-white/5 p-3 text-sm text-white/70 space-y-1">
              {shipping ? (
                <>
                  <p>{shipping.recipient_name}</p>

                  <p>
                    {shipping.street}, {shipping.number}
                  </p>

                  {shipping.complement && <p>{shipping.complement}</p>}

                  <p>
                    {shipping.city} - {shipping.state}
                  </p>

                  <p className="font-mono text-xs text-white/40">
                    CEP {shipping.postal_code}
                  </p>
                </>
              ) : (
                <p className="text-white/40 text-xs">Endereço não disponível</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-widest text-white/30">
                <Truck size={12} />
                FRETE
              </p>

              <div className="rounded-lg bg-white/5 p-3 text-sm text-white/70 space-y-1">
                <p>
                  {order.shipping_carrier} • {order.shipping_method}
                </p>

                <p className="text-xs text-white/40">
                  Prazo estimado: {order.shipping_delivery_days} dias
                </p>

                {order.melhorenvio_cart_id && (
                  <p className="font-mono text-xs text-white/40">
                    Shipment: {order.melhorenvio_cart_id}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-xs tracking-widest text-white/30">
                AÇÕES
              </p>

              <div className="flex flex-wrap gap-2">
                {order.status === "confirmed" && ( // #FEATURE
                  <button
                    onClick={() => onClickOpen?.(order.short_id)}
                    className="flex items-center cursor-pointer gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-mono text-violet-300 hover:bg-violet-400/20"
                  >
                    <RefreshCcw size={11} />
                    Reembolso
                    <NewTooltip
                      icon={<Info size={14} />}
                      textContent="Solicitação passa por análise antes do estorno."
                    />
                  </button>
                )}

                {order.status === "confirmed" && !order.melhorenvio_cart_id && (
                  <button
                    onClick={() => onGenerateShipment?.(order.id)}
                    className="flex items-center cursor-pointer gap-1.5 rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-1.5 text-xs font-mono text-orange-300 hover:bg-orange-400/20"
                  >
                    <Truck size={11} />
                    Gerar envio
                  </button>
                )}

                {order.melhorenvio_cart_id && (
                  <button
                    onClick={() => onBuyLabel?.(order.id!)}
                    className="flex items-center cursor-pointer gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-mono text-emerald-300 hover:bg-emerald-400/20"
                  >
                    <Package size={11} />
                    Comprar etiqueta{" "}
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order.id)}
                  className="flex items-center hover:cursor-pointer gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/50 hover:bg-white/10 hover:text-white/80"
                >
                  <Package size={11} />
                  Ver pedido
                </button>

                {order.melhorenvio_cart_id && ( // rever #FEATURE
                  <button className="flex items-center cursor-pointer gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-mono text-sky-300 hover:bg-sky-400/20">
                    <ExternalLink size={11} />
                    Detalhes envio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminOrderDetailsModal
        orderId={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </motion.div>
  );
};
