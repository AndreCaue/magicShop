import { EachCarousel } from "./Components/LojaCarousel";

import { useEffect, useState } from "react";
import { getListOfProducts } from "@/Repositories/shop/getters";
//https://ibb.co/0kJYCmL - link gerado de imagme.

interface IBrand {
  descricao: string;
  description: string;
  website: string;
  logo_url: string;
  id: number;
}

export interface IProduct {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  brand_id: number;
  id: number;
  brand: IBrand;
}

export const MainBaralhos = () => {
  // const { user } = useUser();
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getListOfProducts();
      setProducts(res);
    })();
  }, []);

  return (
    <>
      <div
      //n mexer
      >
        <div className="py-10 overflow-x-hidden">
          <EachCarousel data={products} mainTitle="BICYCLE" timer={3500} />

          {/* <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} />
          <EachCarousel data={mockImages.data} mainTitle="COPAG" timer={3000} /> */}
        </div>
      </div>
    </>
  );
};
