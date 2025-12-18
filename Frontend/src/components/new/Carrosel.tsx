import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import React from "react";
import Autoplay from "embla-carousel-autoplay";

type TCarouselMain = {
  children: React.ReactNode;
};
//♠♥♦♣
export const CarouselMain = ({ children }: TCarouselMain) => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-xs"
      opts={{ loop: true }}
    >
      <CarouselContent>
        {React.Children.map(children, (child, index) => (
          <CarouselItem key={index}>
            <div className="p-1">{child}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
