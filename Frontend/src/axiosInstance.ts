import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const event = new Event("unauthorizedaa");
      window.dispatchEvent(event);

      toast.error("Sessão expirada. Você será redirecionado para o login.");
    } else if (error.response?.status === 403) {
      toast.error("Você não tem permissão para realizar esta ação.");
    } else if (error.response?.status >= 500) {
      toast.error("Erro no servidor. Tente novamente mais tarde.");
    } else if (!error.response) {
      toast.error(
        "Erro de conexão. Verifique sua internet ou tente novamente."
      );
    } else {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Ocorreu um erro inesperado.";

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
