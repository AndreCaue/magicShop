import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type TCardContainer = {
  className?: string;
  children: React.ReactNode;
  miniIcon?: React.ReactElement;
  colorText?: string;
  spanText: string;
  onClick?: () => void;
  goTo?: string;
};

export const CardContainer = ({
  className,
  children,
  miniIcon,
  colorText = "text-black",
  spanText,
  goTo,
}: TCardContainer) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`shop/${goTo}`);
  };
  /*
  fetch("http://localhost:8000/auth/token", {
  method: "POST",
  body: new URLSearchParams({ username: email, password }),
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  credentials: 'include'
});

fetch("http://localhost:8000/auth/basic-area", { credentials: 'include' })
  */

  // const onClick = async () => {
  //   //função chama para validar.
  //   const res = await isValidEmail();

  //   console.log(res, "teste");
  // };

  return (
    <Card>
      <CardContent
        onClick={handleClick}
        className={cn(
          "flex flex-col aspect-square items-center justify-center p-6 hover:cursor-pointer",
          className
        )}
      >
        <div className="w-full flex text-center">
          <div
            className={cn(" text-4xl text-center place-self-start", colorText)}
          >
            A{miniIcon}
          </div>
          <span className="text-3xl font-semibold w-full flex justify-center items-center mr-5">
            {spanText}
          </span>
        </div>

        {children}
        <div className="w-full flex text-center">
          <span className="text-3xl font-semibold w-full flex justify-center items-center ml-7 rotate-180">
            {spanText}
          </span>
          <div
            className={cn(
              "text-red-500 text-4xl text-center rotate-180",
              colorText
            )}
          >
            A{miniIcon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
