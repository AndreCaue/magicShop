import { BrowserRouter } from "react-router-dom";
import { Background } from "./Pages/Home/Home";
import AppRoutes from "./Routes/routes";
import { AuthProvider } from "./Pages/Provider/AuthProvider";
import "../zodValidation";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Background>
          <AppRoutes />
        </Background>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
