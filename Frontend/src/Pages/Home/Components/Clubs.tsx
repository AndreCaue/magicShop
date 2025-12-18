import { cn } from "@/lib/utils";
import clubs from "../../../assets/cards-club-icon-lg.png";

type TClubs = {
  children?: React.ReactNode;
  className?: string;
};

export const Clubs = ({ children, className }: TClubs) => {
  return (
    <div className={cn("relative h-[85%] w-[85%] m-auto", className)}>
      <img
        src={clubs}
        alt="clubs"
        className="w-full h-auto object-cover text-white bg-white"
      />
      <div className="absolute inset-0 flex items-center justify-center text-white mt-5 text-2xl">
        {children}
      </div>
    </div>
  );
};
