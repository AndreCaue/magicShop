import { MainEspecial } from "@/Pages/Especial/Main";
import { Route, Routes } from "react-router-dom";

export const EspecialRoutes = () => {
  return (
    <Routes>
      <Route element={<MainEspecial />} path="/" />
    </Routes>
  );
};
