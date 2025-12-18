import { cn } from "@/lib/utils";
import clubs from "../../../assets/card-spade.png";
import { useNavigate } from "react-router-dom";

type TSpades = {
  children?: React.ReactNode;
  className?: string;
};

export const Spades = ({ children, className }: TSpades) => {
  const navigate = useNavigate();

  const handleChange = () => {
    navigate("videos");
  };

  return (
    <div
      className={cn(
        "relative h-[85%] w-[85%] flex items-center justify-center cursor-pointer",
        className
      )}
      onClick={handleChange}
    >
      <img
        src={clubs}
        alt="spades"
        className=" text-white bg-white justify-center items-center"
      />
      <div className="absolute inset-0 flex items-center justify-center text-white mt-5 text-2xl">
        {children}
      </div>
    </div>
  );
};
