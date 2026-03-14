import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Circle,
  CircleDashed,
  Clock,
  ExternalLink,
  Info,
  LoaderCircle,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";
import type { TGetUserOrderList } from "@/Repositories/payment/orders";
import type { IOrder } from "./OrdersPage.disabled";
import { NewTooltip } from "@/components/new/Tooltip";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, RefundReasonById } from "@/helpers/generics";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CheckboxForm } from "@/components/new/Checkbox";
import { DropdownForm } from "@/components/new/DropdownForm";
import { useFieldArray } from "react-hook-form";
import { TextAreaForm } from "@/components/new/TextAreaForm";
import { useQuery } from "@tanstack/react-query";
import { getRefundReasons } from "@/Repositories/shop/dropdown";
import QuantitySelector from "@/components/new/QuantitySelector";

const MOCK_ORDERS: IOrder[] = [
  {
    id: "#84291",
    date: "2025-02-28",
    status: "delivered",
    total: 349.9,
    items: [
      { name: "Tênis Runner Pro X", qty: 1, price: 299.9 },
      { name: "Meia Esportiva (2 pares)", qty: 1, price: 50.0 },
    ],
    carrier: "Correios",
    trackingCode: "BR1234567890",
  },
  {
    id: "#84581",
    date: "2025-02-28",
    status: "processing",
    total: 340.9,
    items: [
      { name: "Tênis Runner Pro X", qty: 1, price: 299.9 },
      { name: "Meia Esportiva (2 pares)", qty: 1, price: 50.0 },
    ],
    carrier: "Correios",
    trackingCode: "BR1234567890",
  },
  {
    id: "#84188",
    date: "2025-02-20",
    status: "shipped",
    total: 189.5,
    items: [{ name: "Camiseta Dry-Fit", qty: 3, price: 189.5 }],
    carrier: "Jadlog",
    trackingCode: "JL9876543210",
  },
  {
    id: "#83970",
    date: "2025-02-10",
    status: "refunded",
    total: 520.0,
    items: [{ name: "Smartwatch Fit X3", qty: 1, price: 520.0 }],
  },
  {
    id: "#83741",
    date: "2025-01-30",
    status: "cancelled",
    total: 89.9,
    items: [{ name: "Garrafa Térmica 1L", qty: 1, price: 89.9 }],
  },
  {
    id: "#83502",
    date: "2025-01-18",
    status: "delivered",
    total: 640.0,
    items: [
      { name: "Mochila Urbana 40L", qty: 1, price: 390.0 },
      { name: "Cadeado TSA", qty: 2, price: 125.0 },
      { name: "Organizador de Cabos", qty: 1, price: 125.0 },
    ],
    carrier: "Total Express",
    trackingCode: "TX0011223344",
  },
  {
    id: "#83310",
    date: "2025-01-05",
    status: "pending",
    total: 215.0,
    items: [{ name: "Fone Bluetooth NC-700", qty: 1, price: 215.0 }],
  },
  {
    id: "#83100",
    date: "2024-12-22",
    status: "failed",
    total: 750.0,
    items: [{ name: "Câmera de Ação Ultra 4K", qty: 1, price: 750.0 }],
  },
  {
    id: "#82890",
    date: "2024-12-10",
    status: "delivered",
    total: 159.9,
    items: [
      { name: "Suplemento Whey 1kg", qty: 1, price: 99.9 },
      { name: "Coqueteleira", qty: 1, price: 60.0 },
    ],
    carrier: "Correios",
    trackingCode: "BR0099887766",
  },
];

export type TOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
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
  cancelled: {
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

const Header = () => {
  return (
    <div className="mb-8 flex flex-col gap-1">
      <p className="font-mono text-xs tracking-widest text-white/30">
        ÁREA DO CLIENTE
      </p>
      <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
        Meus Pedidos
      </h1>
      <p className="font-mono text-sm text-white/40">
        {MOCK_ORDERS.length} pedidos encontrados
      </p>
    </div>
  );
};

export { Header, StatusBadge };
