import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import MovingTitle from "@/components/new/StyledMovingTitle";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { IProduct } from "../MainBaralhos";

export type TLojaCarousel = {
  data: IProduct[];
  mainTitle: string;
  timer: number;
  titleClassName?: string;
};

export const EachCarousel = ({
  data,
  mainTitle,
  timer,
  titleClassName,
}: TLojaCarousel) => {
  const plugin = React.useRef(
    Autoplay({
      delay: timer,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      jump: false,
    })
  );

  const currentPath = window.location;

  return (
    <div className="w-full min-w-screen max-w-7xl mx-auto px-4">
      <MovingTitle title={mainTitle} className={cn("", titleClassName)}>
        <Link to={`${currentPath}/branch/${mainTitle}`}>{mainTitle}</Link>
      </MovingTitle>
      <Carousel opts={{ loop: false, duration: 50 }} plugins={[plugin.current]}>
        <CarouselContent className="ml-0">
          {data.map((item, index) => (
            <CarouselItem
              key={index}
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 pl-4"
            >
              <div className="p-2 border w-full">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 flex flex-col h-[225px]">
                    {/* Container das duas imagens */}
                    <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      {/* Grid com as duas imagens lado a lado */}
                      <div className="grid grid-cols-2 h-full gap-1">
                        {/* Primeira imagem */}
                        <div className="overflow-hidden rounded-l-lg">
                          <img
                            src={item.image_urls[0]}
                            alt={`${item.name} - foto 1`}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-75"
                            loading="lazy"
                          />
                        </div>

                        {/* Segunda imagem (se existir) */}
                        {item.image_urls[1] ? (
                          <div className="overflow-hidden rounded-r-lg">
                            <img
                              src={item.image_urls[1]}
                              alt={`${item.name} - foto 2`}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-75"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          /* Placeholder se só tiver uma foto */
                          <div className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-r-lg" />
                        )}
                      </div>

                      {/* Hover overlay opcional (fica bonito) */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                    </div>

                    {/* Nome e preço */}
                    <div className="text-lg font-semibold text-center underline hover:text-primary transition-colors">
                      <Link to={`${currentPath}/product/${item?.id}`}>
                        {item.name}
                      </Link>
                    </div>
                    <b className="text-base text-center mt-2 text-muted-foreground">
                      {item.price}
                    </b>
                  </CardContent>
                  {/* <CardContent className="p-4 flex flex-col items-center h-[225px]">
                    <div className="relative w-full h-24 mb-4 overflow-hidden">
                      {item.image_urls.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${img}-img`}
                          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
                        />
                      ))}
                    </div>
                    <div className="text-lg font-semibold text-center underline">
                      <Link to={`${currentPath}/product/${item?.id}`}>
                        {item.name}
                      </Link>
                    </div>
                    <b className="text-base text-center mt-2">{item.price}</b>
                  </CardContent> */}
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
