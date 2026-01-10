import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const defaultMessage = "Ocorreu um erro inesperado. Tente novamente.";

    let message = defaultMessage;

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        window.dispatchEvent(new Event("unauthorizedaa"));
        message = "Sessão expirada. Você será redirecionado para o login.";
      } else if (status === 403) {
        message = "Você não tem permissão para realizar esta ação.";
      } else if (status >= 500) {
        message = "Erro no servidor. Tente novamente mais tarde.";
      } else {
        message =
          data?.message ||
          data?.error ||
          data?.detail ||
          data?.title ||
          defaultMessage;
      }
    } else if (error.request) {
      message = "Erro de conexão. Verifique sua internet ou tente novamente.";
    } else {
      message = error.message || defaultMessage;
    }

    if (!error.config?.silent) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
