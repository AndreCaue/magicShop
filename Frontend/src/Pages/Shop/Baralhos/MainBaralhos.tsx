import { useEffect, useState } from "react";
import { getListOfProducts } from "@/Repositories/shop/getters";
import DisplayContent from "../Display/DisplayContent";

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
  const [products, setProducts] = useState<IProduct[]>([]);

  console.log(products); // build

  useEffect(() => {
    (async () => {
      const res = await getListOfProducts();
      setProducts(res);
    })();
  }, []);

  return (
    <DisplayContent
      title="Playing Cards"
      subTitle="Cada baralho uma experiência."
      //brand + product
    />
  );
};
