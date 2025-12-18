import { Diamond } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TDiamonds = {
  children: React.ReactNode;
};

export const Diamonds = ({ children }: TDiamonds) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/baralhos");
  };
  return (
    <div
      // style={{ backgroundColor: "#FF0000" }}
      className="   flex justify-center items-center cursor-pointer"
    >
      <Diamond size={250} rotate={45} className="" />
      {/* <button
        type="button"
        onClick={handleClick}
        className="cursor-pointer w-full h-full justify-center flex items-center"
      >
        {children}
      </button> */}
    </div>
  );
};
