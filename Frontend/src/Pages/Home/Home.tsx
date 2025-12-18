import { CarouselMain } from "@/components/new/Carrosel";
import { Club, Diamond, Heart, Spade } from "lucide-react";
import { CardContainer } from "./Components/CardContainer";
import { Topbar } from "@/Topbar/Topbar";
import { toast, Toaster } from "sonner";
import { useEffect, useState } from "react";
import { VerifyDialog } from "./Components/VerifyDialog";
import { AppSidebar } from "@/components/Sidebar/Sidebar";

const initialLocalStorage = localStorage.getItem("is_verify") === "true";

export const Home = () => {
  const [isVerified, setIsVerified] = useState(initialLocalStorage);

  const [isOpen, setIsOpen] = useState(false);

  const handleVerifyEmail = () => {
    setIsOpen(true);
  };

  const handleToastDuration = () => {
    toast.warning("Email não verificado, Clique aqui. Permissões limitadas", {
      duration: 10000,
      position: "bottom-center",
      action: {
        label: "Verificar",
        onClick: handleVerifyEmail,
      },
    });
  };

  useEffect(() => {
    // Atualiza o estado com base no localStorage na montagem do componente
    const verified = localStorage.getItem("is_verify") === "true";
    setIsVerified(verified);

    // Mostra o toast apenas se não estiver verificado
    if (!verified) {
      handleToastDuration();
    }
  }, []);

  return (
    <>
      <CarouselMain>
        <CardContainer
          miniIcon={<Diamond size={30} className="fill-[#FF0000]" />}
          spanText="Vídeos"
          goTo="videos"
        >
          <Diamond size={300} className="fill-[#FF0000]" strokeWidth={1} />
        </CardContainer>
        <CardContainer
          miniIcon={<Spade size={30} className="fill-black" />}
          spanText="Baralhos"
          goTo="baralhos"
        >
          <Spade size={300} className="fill-black" strokeWidth={1} />
        </CardContainer>
        <CardContainer
          miniIcon={<Heart size={30} className="fill-[#FF0000]" />}
          spanText="Trukes"
          goTo="trukes"
        >
          <Heart size={300} className="fill-[#FF0000]" strokeWidth={1} />
        </CardContainer>
        <CardContainer
          miniIcon={<Club size={30} className="fill-black" />}
          spanText="Livros"
          goTo="livros"
        >
          <Club size={300} className="fill-black" strokeWidth={1} />
        </CardContainer>
      </CarouselMain>

      {isOpen && <VerifyDialog isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

type TBackground = {
  children: React.ReactNode;
};

export const Background = ({ children }: TBackground) => {
  return (
    <div className=" min-w-screen min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center">
      {children}
      <Toaster />
    </div>
  );
};
