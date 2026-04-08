import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

import { ExpandedRow } from "./Components/ExpandedRow";

import { SymbolLoading } from "@/components/new/CustomLoading/SymbolLoading";
import { formatDate } from "@/helpers/generics";
import {
  buyLabel,
  getAdminOrdersList,
  type TAdminOrder,
  type TAdminOrdersResponse,
} from "@/Repositories/admin";
import { StatusBadge } from "@/Pages/User/Orders/componentes";
import {
  createCartMelhorEnvio,
  getCartME,
  removeItemCartMEById,
  type TCartMEResponse,
} from "@/Repositories/melhorenvio/frete";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AnimatedSymbols } from "@/Topbar/Components/AnimatedSymbols";

export default function AdminOrdersPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCartDialogOpen, setCartDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<TAdminOrdersResponse>({
    queryKey: ["adminOrders", page],
    queryFn: () => getAdminOrdersList(page),
    placeholderData: (prev) => prev,
  });

  const {
    data: cartData,
    isFetching: isCartLoading,
    refetch: refetchCart,
  } = useQuery<TCartMEResponse[]>({
    queryKey: ["cartME"],
    queryFn: getCartME,
    enabled: false,
  });

  const buyLabelMutation = useMutation({
    mutationFn: (order_uuid: string) => buyLabel(order_uuid),

    onSuccess: () => {
      toast.success("Etiqueta gerada com sucesso");

      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },

    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Erro ao gerar etiqueta";

      toast.error(message);
    },
  });

  const deleteCartMutation = useMutation({
    mutationFn: async (id: string) => {
      return await removeItemCartMEById({ order_uuid: id });
    },

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["cartME"] });

      const previousCart = queryClient.getQueryData(["cartME"]);

      queryClient.setQueryData(["cartME"], (old: any[] = []) =>
        old.filter((item) => item.id !== id),
      );
      return { previousCart };
    },

    onError: (error, id, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cartME"], context.previousCart);
      }

      toast.error("Erro ao deletar item");
    },

    onSuccess: () => {
      toast.success("Item deletado com sucesso");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cartME"] });

      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  if (isError) return <>Erro ao carregar pedidos.</>;

  if (isLoading) return <SymbolLoading />;

  const totalPages = Math.ceil(
    (pagination?.total ?? 0) / (pagination?.page_size ?? 1),
  );

  const handleGenerateShipment = async (order_uuid: string) => {
    const res = await createCartMelhorEnvio({ order_uuid });

    if (!res) return;
    refetch();

    return res;
  };

  const handleOpenCart = async () => {
    setCartDialogOpen(true);
    await refetchCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 pt-20">
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Pedidos</h1>
          <button onClick={handleOpenCart}>Listar itens no Carrinho ME</button>

          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedido"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div className="divide-y divide-white/5 divide-x-2">
            {orders?.map((order: TAdminOrder) => {
              const isExpanded = expandedRow === order.id;

              return (
                <div key={order.id}>
                  <div
                    onClick={() => setExpandedRow(isExpanded ? null : order.id)}
                    className="grid cursor-pointer grid-cols-[140px_1fr_150px_140px_120px_40px] px-6 py-4 gap-2 hover:bg-white/5"
                  >
                    <span className="font-mono text-sm text-white/90 my-auto">
                      {order.short_id}
                    </span>

                    <div className="text-sm text-white/70 min-w-[100px] max-w-[150px]  text-center truncate">
                      {order.shipping?.recipient_name ?? "—"}
                    </div>

                    <span className="text-xs text-center my-auto text-white/50 ">
                      {formatDate(order.created_at)}
                    </span>

                    <span className="text-xs text-white/60 text-center my-auto">
                      <StatusBadge status={order.status} />
                    </span>

                    <span className="text-xs font-mono text-center text-white/70 my-auto">
                      R$ {order.total.toFixed(2)}
                    </span>

                    <div className="flex justify-end">
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown size={14} />
                      </motion.div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedRow
                        order={order}
                        onGenerateShipment={handleGenerateShipment}
                        onBuyLabel={(orderId) =>
                          buyLabelMutation.mutate(orderId)
                        }
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-white/60">
          <span>
            Página {pagination?.page} de {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border cursor-pointer border-white/10 px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg cursor-pointer border border-white/10 px-3 py-1 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </main>
      <Dialog open={isCartDialogOpen} onOpenChange={setCartDialogOpen} modal>
        <DialogContent className="min-w-1/2" background="light">
          <DialogTitle>Carrinho Melhor Envio</DialogTitle>

          {isCartLoading ? (
            <div className="flex place-self-center">
              <AnimatedSymbols />
            </div>
          ) : !cartData?.length ? (
            <div>Não há itens no carrinho.</div>
          ) : (
            cartData.map((item) => (
              <div
                key={item.id}
                className="lg:flex grid justify-between border border-dashed p-1"
              >
                <span>Pedido ID: {item.id}</span>

                <div>
                  <span className="font-bold">Nome: </span>
                  {item.to.name}
                </div>

                <button
                  className="border border-red-500 text-red-500 place-self-end lg:w-44 rounded-2xl px-2"
                  onClick={() => deleteCartMutation.mutate(item.id)}
                  disabled={deleteCartMutation.isPending}
                >
                  {deleteCartMutation.isPending ? "Deletando..." : "Deletar"}
                </button>
              </div>
            ))
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
