import { MainAcessorios } from "@/Pages/Shop/Acessorios/MainAcessorios";
import { Branch } from "@/Routes/Branch";
import { Route, Routes } from "react-router-dom";

export const Acessorios = () => {
  return (
    <Routes>
      <Route element={<MainAcessorios />} path="/" />
      <Route element={<Branch />} path="branch/*" />
      {/* <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" /> */}
    </Routes>
  );
};
