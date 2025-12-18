import { cn } from "@/lib/utils";
import coracao from "../../../assets/heartimg.png";

type THearts = {
  children?: React.ReactNode;
  className?: string;
};

export const Hearts = ({ children, className }: THearts) => {
  return (
    <div className={cn("relative h-[85%] w-[85%] m-auto", className)}>
      <img src={coracao} alt="heart" className="w-full h-auto object-cover" />
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
