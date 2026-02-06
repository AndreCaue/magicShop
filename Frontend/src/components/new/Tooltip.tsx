import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SmokeLink } from "./SmokeLink";

interface ITooltip {
  icon: React.JSX.Element;
  textContent: string;
  className?: string;
  contentStyle?: string;
  link?: string;
}

export const NewTooltip = ({
  icon,
  textContent,
  link,
  className,
  contentStyle,
}: ITooltip) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className={className}>
        {icon}
      </TooltipTrigger>
      <TooltipContent className={contentStyle}>
        <p>
          {textContent}
          {link && (
            <SmokeLink
              textLabel="Saiba Mais"
              textClass="text-blue-500 underline"
              goTo={link}
            />
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
