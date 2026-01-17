import { MainAcessorios } from "@/Pages/Shop/Acessorios/MainAcessorios";
import { Categoria } from "@/Routes/Categoria";
import { Route, Routes } from "react-router-dom";

export const Acessorios = () => {
  return (
    <Routes>
      <Route element={<MainAcessorios />} path="/" />
      <Route element={<Categoria />} path="branch/*" />
    </Routes>
  );
};
