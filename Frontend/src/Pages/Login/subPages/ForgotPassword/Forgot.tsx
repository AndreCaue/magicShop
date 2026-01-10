import useIsMobile from "@/Hooks/isMobile";
import { ForgetForm } from "../Components/ForgetForm";
import { BottomSimbols, TopSimbols } from "./Components/Simbols";

export const ForgotPasswordPage = () => {
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <div>
        <TopSimbols />
        <ForgetForm />
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
      <ForgetForm />
    </div>
  );
};
