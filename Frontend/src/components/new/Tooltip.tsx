import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SmokeLink } from "./SmokeLink";

interface ITooltip {
  icon: React.JSX.Element;
  contentJSX?: React.ReactNode;
  textContent: string;
  className?: string;
  contentStyle?: string;
  link?: string;
  isShippingTip?: boolean;
  side?: "left" | "right" | "top" | "bottom";
}

export const NewTooltip = ({
  icon,
  textContent,
  link,
  className,
  isShippingTip = false,
  contentStyle,
  contentJSX,
  side = "top",
}: ITooltip) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className={className}>
        {icon}
      </TooltipTrigger>
      <TooltipContent className={contentStyle} side={side}>
        <div>
          {textContent}
          {contentJSX}
          {link && (
            <SmokeLink
              textLabel="Saiba Mais"
              textClass="text-blue-500 underline"
              goTo={link}
            />
          )}
          {isShippingTip && (
            <header className="grid grid-cols-4 text-center mt-2 text-gray-300">
              <p>Valor do Frete</p>
              <p>Desconto do Produto</p>
              <p>Frete a Pagar</p>
              <p>Resultado</p>
            </header>
          )}
          {isShippingTip && (
            <div className="grid grid-cols-4 grid-rows-4 h-24 border border-gray-100  mb-2">
              <div>R$ 15,00</div>
              <div>R$ 20,00</div>
              <div>R$ 0,00</div>
              <div>Frete grátis</div>

              <div>R$ 15,00</div>
              <div>R$ 10,50</div>
              <div>R$ 4,50</div>
              <div>Diferença paga</div>

              <div>R$ 11,56</div>
              <div>R$ 0,00</div>
              <div>R$ 11,56</div>
              <div>Sem desconto</div>

              <div>R$ 20,00</div>
              <div>R$ 05,00</div>
              <div>R$ 0,00</div>
              <div>Frete grátis</div>
            </div>
          )}
          {isShippingTip && (
            <span className="flex place-self-end text-red-500">
              !! Promoção durante estoque promocional.
            </span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
