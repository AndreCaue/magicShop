import { getAdminOrderDetails } from "@/Repositories/admin";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

type Props = {
  orderId: string | null;
  onClose: () => void;
};

export const AdminOrderDetailsModal = ({ orderId, onClose }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["adminOrderDetails", orderId],
    queryFn: () => getAdminOrderDetails(orderId!),
    enabled: !!orderId,
  });

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 p-6">
        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Pedido {data?.short_id}
          </h2>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isLoading && <p className="text-white/60">Carregando pedido...</p>}

        {data && (
          <div className="space-y-6">
            {/* PRODUTOS */}

            <div>
              <p className="text-xs text-white/40 mb-2">PRODUTOS</p>

              <div className="space-y-2">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between bg-white/5 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-white">
                      {item.name} ×{item.qty}
                    </span>

                    <span className="font-mono text-sm text-white/70">
                      R$ {item.unit_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAGAMENTO */}

            <div>
              <p className="text-xs text-white/40 mb-2">PAGAMENTO</p>

              <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70">
                <p>Método: {data.payment_method}</p>
                <p>Status: {data.payment_status}</p>
                <p>Total: R$ {data.total.toFixed(2)}</p>
              </div>
            </div>

            {/* ENDEREÇO */}

            {data.shipping && (
              <div>
                <p className="text-xs text-white/40 mb-2">ENTREGA</p>

                <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70">
                  <p>{data.shipping.recipient_name}</p>
                  <p>
                    {data.shipping.street}, {data.shipping.number}
                  </p>
                  <p>
                    {data.shipping.city} - {data.shipping.state}
                  </p>
                  <p>CEP {data.shipping.postal_code}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
