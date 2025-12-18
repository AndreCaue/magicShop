import { BrowserRouter } from "react-router-dom";
import { Background } from "./Pages/Home/Home";
import AppRoutes from "./Routes/routes";
import { AuthProvider } from "./Pages/Provider/AuthProvider";
import { UserProvider } from "./Pages/Provider/UserProvider";
import "../zodValidation";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <Background>
            <AppRoutes />
          </Background>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
