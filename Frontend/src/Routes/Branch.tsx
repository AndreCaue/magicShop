import { Bicycle } from "@/Pages/Shop/Branch/Bicycle";
import { Route, Routes } from "react-router-dom";

export const Branch = () => {
  return (
    <Routes>
      <Route element={<Bicycle />} path="BICYCLE" />
      {/* <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" /> */}
    </Routes>
  );
};
