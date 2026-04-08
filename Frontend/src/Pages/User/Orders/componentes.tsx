import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "canceled"
  | "refunded"
  | "failed";

const STATUS_CONFIG: Record<
  TOrderStatus,
  { label: string; icon: React.ReactNode; color: string; glow: string }
> = {
  pending: {
    label: "Pendente",
    icon: <Clock size={13} />,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    glow: "shadow-amber-500/10",
  },
  confirmed: {
    label: "Pago",
    icon: <CheckCircle size={13} />,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    glow: "shadow-emerald-500/10",
  },
  processing: {
    label: "Preparação para envio",
    icon: <Package size={13} />,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    glow: "shadow-blue-500/10",
  },
  shipped: {
    label: "Em trânsito",
    icon: <Truck size={13} />,
    color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    glow: "shadow-sky-500/10",
  },
  delivered: {
    label: "Entregue",
    icon: <CheckCircle size={13} />,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    glow: "shadow-emerald-500/10",
  },
  canceled: {
    label: "Cancelado",
    icon: <XCircle size={13} />,
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    glow: "shadow-red-500/10",
  },
  refunded: {
    label: "Estornado",
    icon: <RefreshCcw size={13} />,
    color: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    glow: "shadow-violet-500/10",
  },
  failed: {
    label: "Falhou",
    icon: <AlertCircle size={13} />,
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    glow: "shadow-rose-500/10",
  },
};

const StatusBadge = ({ status }: { status: TOrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono tracking-widest ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const Header = ({ ordersLength }: { ordersLength?: number }) => {
  return (
    <div className="mb-8 flex flex-col gap-1">
      <p className="font-mono text-xs tracking-widest text-white/30">
        ÁREA DO CLIENTE
      </p>
      <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
        Meus Pedidos
      </h1>
      <p className="font-mono text-sm text-white/40">
        {ordersLength} pedidos encontrados
      </p>
    </div>
  );
};

export { Header, StatusBadge };
