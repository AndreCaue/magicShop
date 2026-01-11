import { Home } from "@/Pages/Home/Home";

import { Navigate, Route, Routes } from "react-router-dom";
import { Shop } from "./Shop";
import { PrivateRoute } from "@/Security/ProtectedRoute";
import { ForgotPassword } from "@/Pages/Login/subPages/ForgotPassword/Forgot";
import { Register } from "@/Pages/Login/subPages/Register";
import { Conteudo } from "./Conteudo";
import MasterProtectedRouter from "@/Security/MasterProtectedRouter";
import { EspecialRoutes } from "./EspecialRoutes";
import { Layout } from "@/Layout";
import { Login } from "@/Pages/Login/subPages/Login";
import CartPage from "@/Pages/Cart/CartPage";
import { Checkout } from "@/Pages/Checkout/Checkout";
import { RecoveryPassword } from "@/Pages/Login/subPages/ForgotPassword/RecoveryPassword";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/reset_password/:token?" element={<RecoveryPassword />} />

      {/* <Route path="/" element={<Home />} />
      <Route path="/shop/*" element={<Shop />} /> */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop/*" element={<Shop />} />
          <Route path="/conteudo/*" element={<Conteudo />} />
          <Route path="/carrinho/" element={<CartPage />} />
          <Route path="/checkout/" element={<Checkout />} />
        </Route>
      </Route>

      <Route element={<MasterProtectedRouter />}>
        <Route path="/master" element={<EspecialRoutes />} />
      </Route>

      <Route path="*" element={<Navigate to={"/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
