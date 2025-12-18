import { Route, Routes } from "react-router-dom";
import { MainVideo } from "@/Pages/Conteudo/Videos/MainVideo";

export const Conteudo = () => {
  return (
    <Routes>
      <Route element={<MainVideo />} path="/*" />
      {/* <Route element={<Acessorios />} path="/Acessórios/*" /> */}
      {/* <Route element={<Baralhos />} path="baralhos" /> */}

      {/* 
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
