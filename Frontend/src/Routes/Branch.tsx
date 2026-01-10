import { Bicycle } from "@/Pages/Shop/Branch/Bicycle";
import { Route, Routes } from "react-router-dom";

export const Branch = () => {
  return (
    <Routes>
      <Route element={<Bicycle />} path="BICYCLE" />
    </Routes>
  );
};
