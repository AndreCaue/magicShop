import { type TValue } from "@/components/new/DropdownButton";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCartIcon, SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/Hooks/useCart";
import { LogoTopbar } from "./Components/LogoTopbar";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SmokeTabs } from "./Components/SmokeTabs";

const SHOP_OPTIONS = [
  { text: "Baralhos", value: 1 },
  { text: "Acessórios", value: 2 },
  { text: "Gimmick", value: 3 },
];

const CONTENT_OPTIONS = [
  { text: "Vídeos", value: 1 },
  { text: "Livros", value: 2 },
];

const CARD_SYMBOLS = ["♠", "♥", "♦", "♣"] as const;

const AnimatedSymbols = () => (
  <motion.div
    className="hidden lg:flex gap-2 text-lg"
    initial="hidden"
    animate="visible"
    variants={{
      visible: {
        transition: {
          staggerChildren: 0.2,
          repeat: Infinity,
        },
      },
    }}
  >
    {CARD_SYMBOLS.map((symbol) => (
      <motion.span
        key={symbol}
        className="text-black/60"
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.5,
            },
          },
        }}
        aria-hidden="true"
      >
        {symbol}
      </motion.span>
    ))}
  </motion.div>
);

const CartBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-medium text-white"
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
};

export const Topbar = () => {
  const [activeTab, setActiveTab] = useState("baralhos");

  const tabs = [
    { id: "baralhos", label: "Baralhos" },
    { id: "acessorios", label: "Acessórios" },
    { id: "gimmick", label: "Gimmick" },
  ];

  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems = useMemo(
    () => cart?.items?.length ?? 0,
    [cart?.items?.length]
  );

  const handleShopRedirect = (v: TValue) => {
    navigate(`/shop/${v.text.toLowerCase()}`);
  };

  const handleConteudoRedirect = (v: TValue) => {
    navigate(`/conteudo/${v.text.toLowerCase()}`);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCartClick = () => {
    navigate("/carrinho");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-[1600px] mx-auto">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Ir para página inicial"
        >
          <LogoTopbar className="w-auto h-8" />
          <AnimatedSymbols />
        </button>

        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full bg-gray-500">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              type="search"
              disabled
              placeholder="EM DESENVOLVIMENTO"
              className="w-full pl-10 pr-4 h-10 bg-gray-500 border-gray-200 focus:bg-white transition-colors"
              background="light"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <span className="hidden lg:block text-sm text-gray-600">
            Olá, Usuário
          </span>

          <button
            onClick={handleCartClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors active:scale-95"
            aria-label={`Carrinho de compras com ${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
          >
            <ShoppingCartIcon className="w-5 h-5 text-gray-700" />
            <CartBadge count={totalItems} />
          </button>

          <SidebarTrigger className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden" />
        </div>
      </div>

      <SmokeTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Em desenvolvimento."
            disabled
            className="w-full pl-10 pr-4 h-9 disabled:bg-gray-500 border-gray-200 text-sm"
          />
        </div>
      </div>
    </header>
  );
};
