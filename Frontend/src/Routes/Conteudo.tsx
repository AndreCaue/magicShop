import { Route, Routes } from "react-router-dom";
import { MainVideo } from "@/Pages/Conteudo/Videos/MainVideo";

export const Conteudo = () => {
  return (
    <Routes>
      <Route element={<MainVideo />} path="/*" />
    </Routes>
  );
};
