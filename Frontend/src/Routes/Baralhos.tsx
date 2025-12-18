import { MainBaralhos } from "@/Pages/Shop/Baralhos/MainBaralhos";
import { IndividualProduct } from "@/Pages/Shop/Produto";
import { Branch } from "@/Routes/Branch";
import { Route, Routes } from "react-router-dom";

export const Baralhos = () => {
  return (
    <Routes>
      <Route element={<MainBaralhos />} path="/" />
      <Route element={<IndividualProduct />} path="/product/:id" />
      <Route element={<Branch />} path="branch/*" />
      {/* <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" />
      <Route element={<Baralhos />} path="baralhos" /> */}
    </Routes>
  );
};

/*
        <Route
          path={`${submenuCadastros}/${veiculo}/pesquisar`}
          element={<PesquisaVeiculos />}
        />
        {[
          `${submenuCadastros}/${veiculo}/novo`,
          `${submenuCadastros}/${veiculo}/editar/:id`,
        ].map((path, index) => (
          <Route key={index} path={path} element={<FormularioVeiculo />} />
        ))}

*/
