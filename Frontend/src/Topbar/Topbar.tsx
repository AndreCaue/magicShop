// import { type TValue } from "@/components/new/DropdownButton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/Hooks/useCart";
import { LogoTopbar } from "./Components/LogoTopbar";
import { useMemo, useState } from "react";
import { SmokeTabs } from "./Components/SmokeTabs";
import { useAuth } from "@/Hooks/useAuth";
import useIsMobile from "@/Hooks/isMobile";
import { AnimatedSymbols } from "./Components/AnimatedSymbols";
import { CartBadge } from "./Components/CartBadge";
import { SearchInput } from "./Components/SearchInput";
import { SearchInput2 } from "./Components/SearchInput2";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { UserTopbar } from "./Components/User/UserTopbar";
import { cn } from "@/lib/utils";
import { topbarTab } from "./utils";
import type { TValue } from "@/components/new/DropdownButton";

const formSchema = z.object({
  search: z.string(),
});

type TForm = z.infer<typeof formSchema>;

export const Topbar = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("");
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const totalItems = useMemo(
    () => cart?.items?.length ?? 0,
    [cart?.items?.length],
  );

  const handleLogout = (value: TValue) => {
    switch (value.text) {
      case "Logout":
        logout();
    }
  };

  const onSubmit = () => {};

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 lg:px-2 max-w-[1600px] mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Ir para página inicial"
        >
          <LogoTopbar className="w-auto h-8" />
          <AnimatedSymbols hide={isMobile} />
        </button>
        <AnimatedSymbols hide={!isMobile} />
        <div
          //Search input v2 (+/-) desktop
          className="hidden lg:flex "
        >
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <SearchInput2
                name="search"
                control={control}
                onSearch={() => {}}
                disabled={isSubmitting || true}
              />
            </form>
          </Form>
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <UserTopbar
            userEmail={user?.email ?? ""}
            onSelect={handleLogout}
            label="hidden lg:flex"
            options={[
              { text: "Logout", value: 1 },
              { text: "Configuração", value: 2, disabled: true },
            ]}
          />

          <button
            onClick={() => navigate("/carrinho")}
            className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors active:scale-95"
            aria-label={`Carrinho de compras com ${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
          >
            <ShoppingCartIcon className="w-5 h-5 text-gray-700 " />
            <CartBadge count={totalItems} />
          </button>
          <SidebarTrigger
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden",
              user?.isMaster && "lg:flex",
            )}
          />
        </div>
      </div>

      <SmokeTabs
        tabs={topbarTab}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/*Search input v1 Descontrolado */}
      {isMobile && <SearchInput background="light" disabled />}
    </header>
  );
};
