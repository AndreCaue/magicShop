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
    <div className="   flex justify-center items-center cursor-pointer">
      <Diamond size={250} rotate={45} className="" />
    </div>
  );
};
