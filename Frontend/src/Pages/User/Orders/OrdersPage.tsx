import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type CellContext,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Search,
  Package,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getUserOrderList,
  type TGetUserOrderList,
} from "@/Repositories/payment/orders";
import { formatDate } from "@/helpers/generics";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Header, StatusBadge, type TOrderStatus } from "./componentes";
import { ExpandedRow } from "./Components/ExpandedRow";
import { SymbolLoading } from "@/components/new/CustomLoading/SymbolLoading";
import { DialogRefund } from "./Components/DialogRefund";

// PENDING = "pending"            # pedido criado
// CONFIRMED = "confirmed"        # pagamento confirmado
// PROCESSING = "processing"      # separando / embalando
// SHIPPED = "shipped"            # enviado
// DELIVERED = "delivered"        # entregue
// CANCELED = "canceled"          # cancelado
// REFUNDED = "refunded"          # reembolsado

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface IOrder {
  id: string;
  date: string;
  status: TOrderStatus;
  total: number;
  items: IOrderItem[];
  carrier?: string;
  trackingCode?: string;
}

export default function OrdersPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<TGetUserOrderList>();
  const [isOpen, setOpen] = useState(false);
  const { open } = useSidebar();

  const {
    data: orders,
    isLoading: ordersLoading,
    isError,
  } = useQuery({
    queryKey: ["userOrders"],
    queryFn: getUserOrderList,
    select: (data) =>
      data?.map((each) => ({
        ...each,
        date: formatDate(each.created_at),
      })),
  });

  const onClickRefund = (orderId: string) => {
    const currentOrder = orders?.filter((order) => order.short_id === orderId);
    if (!currentOrder?.length) return;
    console.log(currentOrder, "order correta");
    setSelectedOrder(currentOrder[0]);
    setOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const columns = useMemo<ColumnDef<TGetUserOrderList>[]>(
    () => [
      {
        accessorKey: "short_id",
        header: "PEDIDO",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-white/90">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "date",
        header: "DATA",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-white/50">
            {new Date(getValue<string>()).toLocaleDateString("pt-BR")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ getValue }) => (
          <StatusBadge status={getValue<TOrderStatus>()} />
        ),
      },
      {
        accessorKey: "items",
        header: "ITENS",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-white/40">
            {getValue<IOrderItem[]>().length}{" "}
            {getValue<IOrderItem[]>().length === 1 ? "item" : "itens"}
          </span>
        ),
      },
      {
        accessorKey: "total",
        header: "TOTAL",
        cell: ({ getValue }) => (
          <span className="font-mono text-sm font-medium text-white/80">
            R$ {getValue<number>().toFixed(2)}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData ?? [],
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const STATUS_FILTERS: { value: TOrderStatus | "all"; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendentes" }, // verificar no banckend como mudar status quando vencido.
    { value: "processing", label: "Preparação para envio" },
    { value: "shipped", label: "Em trânsito" },
    { value: "delivered", label: "Entregues" },
    { value: "cancelled", label: "Cancelados" },
    { value: "refunded", label: "Estornados" },
    { value: "failed", label: "Falhos" },
  ];

  return (
    <>
      {isError ? (
        <>Deu erro tente novamente.</>
      ) : ordersLoading ? (
        <SymbolLoading />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 font-sans pt-20">
          <main
            className={cn(
              "relative z-10 mx-auto max-w-6xl px-6 py-12",
              open && "z-0",
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <Header ordersLength={orders?.length} />
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full max-w-xs">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      placeholder="Buscar pedido..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 font-mono text-sm text-white/80 placeholder-white/20 outline-none transition-colors focus:border-violet-400/40 focus:bg-white/8"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-widest transition-all
                        ${
                          statusFilter === f.value
                            ? "border-violet-400/40 bg-violet-400/15 text-violet-300"
                            : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/8 bg-black/20 shadow-2xl shadow-black/30 backdrop-blur-sm">
                  <div className="border-b border-white/5">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <div
                        key={headerGroup.id}
                        className="grid grid-cols-[1fr_1fr_1.5fr_0.7fr_1fr_40px] px-6 py-3"
                      >
                        {headerGroup.headers.map((header) => (
                          <div
                            key={header.id}
                            className="flex cursor-pointer select-none items-center gap-1"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="font-mono text-xs tracking-widest text-white/25">
                              {header.column.columnDef.header as string}
                            </span>
                            {header.column.getCanSort() && (
                              <ArrowUpDown
                                size={10}
                                className="text-white/15"
                              />
                            )}
                          </div>
                        ))}
                        <div />
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-white/5">
                    <AnimatePresence>
                      {table.getRowModel().rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Package size={32} className="mb-3 text-white/15" />
                          <p className="font-mono text-sm text-white/30">
                            Nenhum pedido encontrado.
                          </p>
                        </div>
                      ) : (
                        table.getRowModel().rows.map((row, i) => {
                          const order = row.original;
                          const isExpanded = expandedRow === order.id;

                          return (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.2 }}
                            >
                              <div
                                onClick={() =>
                                  setExpandedRow(isExpanded ? null : order.id)
                                }
                                className={`grid cursor-pointer grid-cols-[1fr_1fr_1.5fr_0.7fr_1fr_40px] items-center px-6 py-4 transition-colors
                                ${isExpanded ? "bg-white/4" : "hover:bg-white/3"}`}
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <div key={cell.id}>
                                    {cell.column.columnDef.cell
                                      ? (
                                          cell.column.columnDef.cell as (
                                            context: CellContext<
                                              TGetUserOrderList,
                                              unknown
                                            >,
                                          ) => React.ReactNode
                                        )(cell.getContext())
                                      : cell.getValue<string>()}
                                  </div>
                                ))}
                                <div className="flex justify-end">
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown
                                      size={14}
                                      className="text-white/25"
                                    />
                                  </motion.div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <ExpandedRow
                                    key="expanded"
                                    order={order}
                                    onClickOpen={onClickRefund}
                                  />
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 px-6 py-3">
                    <span className="font-mono text-xs text-white/25">
                      Página {table.getState().pagination.pageIndex + 1} de{" "}
                      {table.getPageCount()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition-colors hover:border-white/20 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-20"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 transition-colors hover:border-white/20 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-20"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>

          {isOpen && (
            <DialogRefund
              isOpen={isOpen}
              setOpen={setOpen}
              order={selectedOrder}
            />
          )}
        </div>
      )}
    </>
  );
}
