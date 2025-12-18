import blueBy from "../../../assets/BicycleBlue.png";
import bluebyDec from "../../../assets/blue-bicycle-decline.png";
import { EachCarousel } from "../Baralhos/Components/LojaCarousel";

const mockImages = {
  data: [
    {
      img: [blueBy, bluebyDec],
      price: 12,
      title: "Dedo Mágico",
    },
    {
      img: [blueBy, bluebyDec],
      price: 40,
      title: "Baralho Bicycle Standard BLUE",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard BLACK",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
  ],
};

export const MainAcessorios = () => {
  return (
    <>
      <div
      //n mexer
      >
        <div className="flex flex-col gap-20 overflow-x-hidden">
          <div className="py-10 overflow-x-hidden">
            <EachCarousel
              data={mockImages.data}
              mainTitle="Produtos internos"
              timer={3500}
            />
            <EachCarousel
              data={mockImages.data}
              mainTitle="Produtos internos"
              timer={3500}
            />
          </div>

          <div className="py-10 overflow-x-hidden">
            <EachCarousel
              data={mockImages.data}
              mainTitle="Produtos externos"
              titleClassName="text-amber-100"
              timer={3000}
            />
            <EachCarousel
              data={mockImages.data}
              titleClassName="text-amber-100"
              mainTitle="Produtos externos"
              timer={3000}
            />
          </div>
        </div>
      </div>
    </>
  );
};
