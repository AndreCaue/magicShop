import { Bicycle } from "@/Pages/Shop/Categoria/Bicycle";
import { Route, Routes } from "react-router-dom";

export const Categoria = () => {
  return (
    <Routes>
      <Route element={<Bicycle />} path="BICYCLE" />
    </Routes>
  );
};
