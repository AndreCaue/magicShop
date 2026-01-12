import { DropdownButton, type TValue } from "@/components/new/DropdownButton";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/Hooks/useCart";
import { LogoTopbar } from "./Components/LogoTopbar";
import { motion } from "framer-motion";
import { SimbolLoading } from "@/Security/CustomLoading/SimbolLoading";

const opt = [
  {
    text: "Baralhos",
    value: 1,
  },
  {
    text: "Acessórios",
    value: 2,
  },
  { text: "Gimmick", value: 3 },
];

const symbols = ["♠", "♥", "♦", "♣"];

const conteudoOptions = [
  { text: "Vídeos", value: 1 },
  { text: "Livros", value: 2 },
];

export const Topbar = () => {
  const navigate = useNavigate();
  // const { isLoggedIn } = useAuth();
  const { cart } = useCart();

  const totalItems = cart?.items?.length ?? 0;

  const handleShopRedirect = (v: TValue) => {
    navigate(`shop/${v.text}`);
  };
  const handleConteudoRedirect = (v: TValue) => {
    navigate(`conteudo/${v.text}`);
  };

  return (
    <div>
      <header className="fixed left-0 top-0 right-0 z-10 bg-white grid grid-cols-3 h-20 text-black">
        <div className="col-span-3 grid grid-cols-9 gap-10  ">
          <button className="col-span-2 flex cursor-pointer hover:scale-105 place-self-center place-items-center gap-4">
            <LogoTopbar className="place-self-center ml-10 lg:ml-0" />
            <div className="hidden lg:flex">
              <motion.div
                className="flex gap-3 text-xl mb-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.25,
                      repeat: Infinity,
                    },
                  },
                }}
              >
                {symbols.map((symbol) => (
                  <motion.span
                    key={symbol}
                    className="text-black/80 justify-self-center"
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: 0.6,
                        },
                      },
                    }}
                  >
                    {symbol}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </button>

          <div className="col-span-5">
            <Input />
          </div>

          <div className="col-span-2 grid grid-cols-2 place-items-center">
            <div className="hidden lg:flex">Olá Usuário</div>
            <button
              className="relative w-fit h-12 hover:scale-110 cursor-pointer justify-center"
              onClick={() => navigate("/carrinho")}
            >
              <ShoppingCartIcon />

              {totalItems > 0 && (
                <span className="absolute flex items-center justify-center top-1 -right-1 bg-red-500 h-4 w-4 rounded-full text-xs text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <DropdownButton
          label="Loja"
          options={opt}
          onSelect={handleShopRedirect}
        ></DropdownButton>

        <SidebarTrigger className="border h-full w-full cursor-pointer" />

        <DropdownButton
          label="Conteúdo"
          options={conteudoOptions}
          onSelect={handleConteudoRedirect}
        ></DropdownButton>
      </header>
    </div>
  );
};
