import { Route, Routes } from "react-router-dom";
import { Baralhos } from "./Baralhos";
import { Acessorios } from "./Acessorios";

export const Shop = () => {
  return (
    <Routes>
      <Route element={<Baralhos />} path="baralhos/*" />
      <Route element={<Acessorios />} path="/Acessórios/*" />
    </Routes>
  );
};
