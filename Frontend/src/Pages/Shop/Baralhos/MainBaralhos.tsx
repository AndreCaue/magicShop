import { useEffect, useState } from "react";
import { getListOfProducts } from "@/Repositories/shop/getters";
import DisplayContent from "../Display/DisplayContent";

export const MainBaralhos = () => {
  const [products, setProducts] = useState<IProduct[]>([]);

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
      productData={products}
    />
  );
};
