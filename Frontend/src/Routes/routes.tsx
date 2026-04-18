import { Home } from "@/Pages/Home/Home";

import { Navigate, Route, Routes } from "react-router-dom";
import { Shop } from "./Shop";
import { PrivateRoute } from "@/Security/ProtectedRoute";
import { ForgotPassword } from "@/Pages/Login/subPages/ForgotPassword/Forgot";
import { Conteudo } from "./Conteudo";
import MasterProtectedRouter from "@/Security/MasterProtectedRouter";
import { EspecialRoutes } from "./EspecialRoutes";
import { Layout } from "@/Layout";
import { Login } from "@/Pages/Login/subPages/Login";
import CartPage from "@/Pages/Cart/CartPage";
import { Checkout } from "@/Pages/Checkout/Checkout";
import { RecoveryPassword } from "@/Pages/Login/subPages/ForgotPassword/RecoveryPassword";
import { Register } from "@/Pages/Login/subPages/Register/Register";
import { CheckoutPayment } from "@/Pages/Checkout/CheckoutPayment";
import OrdersPage from "@/Pages/User/Orders/OrdersPage";
import AdminOrdersPage from "@/Pages/Admin/Pedidos";
import { PageDevelopment } from "@/global/PageInDevelopment";

import { PrivacyPolicy } from "@/Pages/Legal/PrivacyPolicy";
import { LogisticsPolicy } from "@/Pages/Legal/LogisticsPolicy";
import { PaymentPolicy } from "@/Pages/Legal/PaymentPolicy";
import { RefundPolicy } from "@/Pages/Legal/RefundPolicy";
import MetricDashboard from "@/Pages/Dashboard/Dashboard";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/reset_password/:token?" element={<RecoveryPassword />} />
      <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
      <Route path="/politica-de-transporte" element={<LogisticsPolicy />} />
      <Route path="/politica-de-pagamento" element={<PaymentPolicy />} />
      <Route path="/politica-de-troca" element={<RefundPolicy />} />

      <Route path="/examples/dashboard" element={<MetricDashboard />} />

      {/* <Route path="/" element={<Home />} />
      <Route path="/shop/*" element={<Shop />} /> */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/*Lojas */}
          <Route path="/loja/*" element={<Shop />} />

          {/*Lojas */}

          {/*Conteudo */}

          <Route path="/conteudo/*" element={<Conteudo />} />
          {/*Conteudo */}

          {/*Checkout / Carrinho */}
          <Route path="/carrinho/" element={<CartPage />} />
          <Route path="/checkout/" element={<Checkout />} />
          <Route path="/checkout/:id" element={<CheckoutPayment />} />

          {/*Carrinho */}

          {/* <Route path="/teste" element={<TesteDef />} /> */}
          <Route path="/jogos/*" element={<PageDevelopment />} />
          {/* Jogos */}

          {/*User */}
          <Route path="/user/pedidos" element={<OrdersPage />} />
        </Route>
      </Route>

      <Route element={<MasterProtectedRouter />}>
        <Route path="/master" element={<EspecialRoutes />} />
        <Route path="/master/pedidos" element={<AdminOrdersPage />} />
      </Route>

      <Route path="*" element={<Navigate to={"/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
