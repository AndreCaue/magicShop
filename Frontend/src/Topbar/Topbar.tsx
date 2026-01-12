import { DropdownButton, type TValue } from "@/components/new/DropdownButton";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/Hooks/useCart";
import { LogoTopbar } from "./Components/LogoTopbar";
import { motion } from "framer-motion";

const shopOptions = [
  { text: "Baralhos", value: 1 },
  { text: "Acessórios", value: 2 },
  { text: "Gimmick", value: 3 },
];

const contentOptions = [
  { text: "Vídeos", value: 1 },
  { text: "Livros", value: 2 },
];

const symbols = ["♠", "♥", "♦", "♣"];

export const Topbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems = cart?.items?.length ?? 0;

  const redirect = (path: string) => (v: TValue) =>
    navigate(`/${path}/${v.text}`);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b">
      {/* Linha principal */}
      <div className="flex h-20 items-center justify-between px-6 gap-6">
        {/* Esquerda */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <LogoTopbar />

            <motion.div
              className="hidden lg:flex gap-2 text-lg text-black/70"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              {symbols.map((s) => (
                <motion.span
                  key={s}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 0.8,
                      },
                    },
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          </button>
        </div>

        {/* Centro */}
        <div className="hidden md:block flex-1 max-w-lg">
          <Input placeholder="Buscar produtos, vídeos ou livros…" />
        </div>

        {/* Direita */}
        <div className="flex items-center gap-6">
          <span className="hidden lg:block text-sm text-muted-foreground">
            Olá, Usuário
          </span>

          <button
            onClick={() => navigate("/carrinho")}
            className="relative hover:scale-105 transition"
            aria-label="Carrinho"
          >
            <ShoppingCartIcon />

            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Linha secundária */}
      <nav className="hidden lg:flex items-center justify-center gap-8 h-12 text-sm">
        <DropdownButton
          label="Loja"
          options={shopOptions}
          onSelect={redirect("shop")}
        />
        <DropdownButton
          label="Conteúdo"
          options={contentOptions}
          onSelect={redirect("conteudo")}
        />
      </nav>
    </header>
  );
};
