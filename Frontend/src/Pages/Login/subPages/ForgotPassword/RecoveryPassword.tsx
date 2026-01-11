import useIsMobile from "@/Hooks/isMobile";

// import { useSearchParams } from "react-router-dom";
import { BottomSimbols, TopSimbols } from "./Components/Simbols";
import { RecoveryForm } from "./Components/RecoveryForm";

export const RecoveryPassword = () => {
  const isMobile = useIsMobile();
  // const [searchParams] = useSearchParams();
  // const token = searchParams.get("token");
  // console.log(token); // parei aqui

  if (isMobile)
    return (
      <div>
        <TopSimbols />
        <RecoveryForm />
        <BottomSimbols />
      </div>
    );

  return (
    <div
      className="flex md:h-[500px] md:w-[500px]  px-24 justify-center items-center rotate-45"
      style={{
        background:
          "linear-gradient(45deg, #f9f6ec, #88a1a8, #502940, #790614, #0d0c0c)",
      }}
    >
      <RecoveryForm />
    </div>
  );
};
