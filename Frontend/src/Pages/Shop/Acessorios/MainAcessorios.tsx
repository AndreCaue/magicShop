import blueBy from "../../../assets/BicycleBlue.png";
import bluebyDec from "../../../assets/blue-bicycle-decline.png";
import { EachCarousel } from "../Baralhos/Components/LojaCarousel";
import type { IProduct } from "../Baralhos/MainBaralhos";

const mockImages: IProduct[] = [
  {
    image_urls: [blueBy, bluebyDec],
    price: 12,
    name: "Dedo Mágico",
    brand: {
      descricao: "Made in China",
      description: "Made in China",
      id: 1,
      logo_url: "",
      website: "",
    },
    brand_id: 1,
    description: "dedo magico de plasticos tamanho diversos.",
    id: 12,
    stock: 100,
  },
];

export const MainAcessorios = () => {
  return (
    <>
      <div>
        <div className="flex flex-col gap-20 overflow-x-hidden">
          <div className="py-10 overflow-x-hidden">
            <EachCarousel
              data={mockImages}
              mainTitle="Produtos internos"
              timer={3500}
            />
            <EachCarousel
              data={mockImages}
              mainTitle="Produtos internos"
              timer={3500}
            />
          </div>

          <div className="py-10 overflow-x-hidden">
            <EachCarousel
              data={mockImages}
              mainTitle="Produtos externos"
              titleClassName="text-amber-100"
              timer={3000}
            />
            <EachCarousel
              data={mockImages}
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
