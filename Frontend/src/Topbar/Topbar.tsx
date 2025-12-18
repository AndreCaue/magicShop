import { DropdownButton, type TValue } from "@/components/new/DropdownButton";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/Hooks/useAuth";
import { useUser } from "@/Services/userService";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/Logo LM.png";
import { useCart } from "@/Hooks/useCart";

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

const conteudoOptions = [
  { text: "Vídeos", value: 1 },
  { text: "Livros", value: 2 },
];

export const Topbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, handleLogout } = useAuth();
  const { user } = useUser();
  const { cart } = useCart();

  const totalItems = cart?.items?.length ?? 0;

  const handleShopRedirect = (v: TValue) => {
    navigate(`shop/${v.text}`);
  };
  const handleConteudoRedirect = (v: TValue) => {
    navigate(`conteudo/${v.text}`);
  };

  const handleClick = (v: TValue) => {
    navigate("/");

    switch (v.value) {
      case 1:
        handleLogout();
        navigate("/login");
        break;
      case 9:
        navigate("/master");
    }

    if (v.value === 1) {
      handleLogout();
      navigate("/login");
    }
  };

  if (!isLoggedIn) return <></>;

  return (
    <div>
      <header className="fixed left-0 top-0 right-0 z-10 bg-white grid grid-cols-3 h-20 text-black">
        <div className="col-span-3 grid grid-cols-9 gap-10  ">
          <button className="col-span-2 grid lg:grid-cols-2  cursor-pointer hover:scale-105">
            <img
              alt="logo"
              src={logo}
              className="h-10 w-10 rounded-full mx-3 hover:scale-105 place-self-center"
            />
            <div className="text-start hover:scale-105 hidden lg:flex shrink-1">
              Mágica Cartas e Distribuição
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
