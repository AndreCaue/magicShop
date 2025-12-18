import api from "../axiosInstance";
import { toast } from "sonner";

type TGetValidationLogin = {
  username: string;
  password: string;
};

export const getValidationLogin = async (params: TGetValidationLogin) => {
  try {
    const response = await api.post(
      "/auth/token",
      new URLSearchParams(params),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erro na requisição de login:", error);
    return { error: true, message: "Falha na autenticação" };
  }
};

type TGetCadastroParams = {
  email: string;
  password: string;
};

export const createCadastro = async (params: TGetCadastroParams) => {
  try {
    const response = await api.post(`/auth/register`, { ...params });
    return response?.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const catchMessage =
      err.response.data.detail || "Erro ao realizar cadastro";

    return { error: catchMessage };
  }
};

export const verifyValidationEmail = async (code: string) => {
  try {
    const response = await api.post(
      `/auth/verify`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token JWT
        },
      }
    );
    return response.data;
  } catch (err) {
    toast.error(err as string);
  }
};
