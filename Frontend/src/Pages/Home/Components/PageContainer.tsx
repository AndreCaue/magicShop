import { initialStile } from "@/global/globalStyle";
import { cn } from "@/lib/utils";

type TPageContainer = {
  className?: string;
  children: React.ReactNode;
};

export const PageContainer = ({ children, className }: TPageContainer) => {
  return <div className={cn(`${className}`, initialStile)}>{children}</div>;
};
