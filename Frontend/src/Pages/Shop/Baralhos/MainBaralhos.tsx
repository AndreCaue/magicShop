import { useEffect, useState } from "react";
import { getProducts } from "@/Repositories/shop/getters";
import DisplayContent from "../Display/DisplayContent";

export const MainBaralhos = () => {
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    (async () => {
      const res = await getProducts();
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
