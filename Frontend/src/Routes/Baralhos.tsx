import { MainBaralhos } from "@/Pages/Shop/Baralhos/MainBaralhos";
import { IndividualProduct } from "@/Pages/Shop/Produto";
import { Categoria } from "@/Routes/Categoria";
import { Route, Routes } from "react-router-dom";

export const Baralhos = () => {
  return (
    <Routes>
      <Route element={<MainBaralhos />} path="/" />
      <Route element={<IndividualProduct />} path="/product/:id" />
      <Route element={<Categoria />} path="branch/*" />
    </Routes>
  );
};
