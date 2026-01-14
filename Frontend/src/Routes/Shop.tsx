import { Route, Routes } from "react-router-dom";
import { Baralhos } from "./Baralhos";
import { Acessorios } from "./Acessorios";

export const Shop = () => {
  return (
    <Routes>
      <Route
        //add Main before jsxName
        //parei aqui
        element={<Baralhos />}
        path="baralhos/*"
      />
      <Route element={<Acessorios />} path="/acessorios/*" />
      <Route element={<Acessorios />} path="/trukes/*" />
      <Route element={<Acessorios />} path="/marcas/*" />
      {/* <Route path="/" element={<MainJogo />} /> */}
    </Routes>
  );
};
