// MasterDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "./Charts/StatChart";
import { DonutChart } from "./Charts/DonutChart";
import { SimpleBarChart } from "./Charts/SimpleBarChart";
import { StockBarChart } from "./Charts/StockBarChart";
import { SummaryCard } from "./Charts/SummaryCard";
import { SymbolLoading } from "@/components/new/CustomLoading/SymbolLoading";

interface DashboardStats {
  sales_by_state: Record<string, number>;
  payment_methods: Record<string, number>;
  total_gross_sales: number;
  total_available_stock: number;
  total_reserved_stock: number;
  users_by_role: Record<string, number>;
  orders_by_status: Record<string, number>;
  total_stock: number;
  total_orders: number;
  total_users: number;
  total_products: number;
}

const mockDashboardData: DashboardStats = {
  sales_by_state: { SP: 896, RJ: 328, PR: 203, MG: 73 },
  payment_methods: { PIX: 1156, CREDIT_CARD: 298 },
  total_gross_sales: 58740.75,
  total_stock: 2650,
  total_available_stock: 2350,
  total_reserved_stock: 350,
  users_by_role: { Nao_Assinantes: 2600, Assinantes: 234 },
  orders_by_status: {
    Confirmado: 1400,
    Pendente: 876,
    Transito: 43,
    Entregue: 1400,
    Cancelado: 134,
  },
  total_orders: 1698,
  total_users: 2834,
  total_products: 35,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function MetricDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats(mockDashboardData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !stats)
    return (
      <div className="p-8 flex flex-col gap-3">
        <>
          <SymbolLoading />

          <span className="animate-pulse text-white">Calculando dados...</span>
        </>
      </div>
    );

  const stateData = Object.entries(stats.sales_by_state).map(
    ([name, value]) => ({ name, value }),
  );
  const statusData = Object.entries(stats.orders_by_status).map(
    ([name, value]) => ({ name, value }),
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Métricas Gerais
            </h1>
            <p className="text-zinc-400 mt-1">
              Visão geral do e-commerce •{" "}
              {format(new Date(), "dd 'de' MMMM yyyy")}
            </p>
          </div>
          <span className="text-center text-gray-800">
            Gráficos gerados com dados falsos
          </span>
          <Button
            variant="outline"
            className="bg-black"
            onClick={() => window.location.reload()}
          >
            Atualizar dados
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Vendido (Bruto)"
            value={`R$ ${stats.total_gross_sales.toLocaleString("pt-BR")}`}
            icon={DollarSign}
            iconColor="text-emerald-500"
            trend="+12.5% este mês"
          />
          <StatCard
            title="Pedidos Totais"
            value={stats.total_orders}
            icon={Clock}
            iconColor="text-blue-500"
            badge="+11 hoje"
          />
          <StatCard
            title="Estoque Disponível"
            value={stats.total_available_stock}
            icon={Package}
            iconColor="text-amber-500"
            subtitle={`Reservado: ${stats.total_reserved_stock}`}
          />
          <StatCard
            title="Usuários Ativos"
            value={stats.total_users}
            icon={Users}
            iconColor="text-violet-500"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleBarChart
            title="Vendas por Região (UF)"
            description="Quantidade de pedidos por estado"
            data={stateData}
            color="#3b82f6"
            icon="map-pin"
            colSpan={2}
          />

          <SimpleBarChart
            title="Pedidos por Status"
            description="Distribuição atual dos pedidos"
            data={statusData}
            color="#a855f7"
            colSpan={2}
          />

          <StockBarChart
            available={stats.total_available_stock}
            reserved={stats.total_reserved_stock}
            sold={stats.total_orders}
          />

          <DonutChart
            title="Perfil de Clientes"
            description="Assinantes vs não assinantes"
            icon="users"
            data={[
              {
                name: "Assinantes",
                value: stats.users_by_role.Assinantes ?? 0,
                color: "#a855f7",
              },
              {
                name: "Não Assinantes",
                value: stats.users_by_role.Nao_Assinantes ?? 0,
                color: "#b8c7cc",
              },
            ]}
          />

          <DonutChart
            title="Métodos de Pagamento"
            description="Distribuição dos pagamentos"
            icon="credit-card"
            data={[
              {
                name: "PIX",
                value: stats.payment_methods.PIX ?? 0,
                color: "#3b82f6",
              },
              {
                name: "Cartão",
                value: stats.payment_methods.CREDIT_CARD ?? 0,
                color: "#8b5cf6",
              },
            ]}
          />
        </div>

        <SummaryCard
          items={[
            { label: "Clientes", value: stats.total_users },
            {
              label: "Não Assinantes",
              value: stats.users_by_role.Nao_Assinantes ?? 0,
            },
            { label: "Assinantes", value: stats.users_by_role.Assinantes ?? 0 },
            {
              label: "Melhor Região",
              value: stateData.map((item) => item.name)[0],
              highlight: "emerald",
            },
          ]}
        />
      </div>
    </div>
  );
}
