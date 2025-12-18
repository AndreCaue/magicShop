import axios from "axios";
import { toast } from "sonner"; // ou "react-toastify", ajuste conforme a lib que você usa

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia o cookie HttpOnly automaticamente
});

// Interceptador de resposta global
api.interceptors.response.use(
  (response) => {
    // Sucesso (2xx) - nada a fazer, só retorna
    return response;
  },
  (error) => {
    // Qualquer erro (4xx, 5xx, sem conexão etc.)

    // 401: sessão expirada / não autorizado
    if (error.response?.status === 401) {
      const event = new Event("unauthorizedaa"); // mantenha seu evento global
      window.dispatchEvent(event);

      // Opcional: toast específico para logout
      toast.error("Sessão expirada. Você será redirecionado para o login.");
    }
    // 403: sem permissão
    else if (error.response?.status === 403) {
      toast.error("Você não tem permissão para realizar esta ação.");
    }
    // Erros 5xx: problema no servidor
    else if (error.response?.status >= 500) {
      toast.error("Erro no servidor. Tente novamente mais tarde.");
    }
    // Sem conexão ou timeout
    else if (!error.response) {
      toast.error(
        "Erro de conexão. Verifique sua internet ou tente novamente."
      );
    }
    // Outros erros (400, 422, 404 etc.) - tenta pegar mensagem da API
    else {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Ocorreu um erro inesperado.";

      toast.error(message);
    }

    // Sempre rejeita a promise para que o catch local (se existir) ainda funcione
    return Promise.reject(error);
  }
);

export default api;
