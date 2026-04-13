import { handleErrorReq } from "@/helpers/generics";
import api from "../axiosInstance";

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
      },
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
  const response = await api.post(`/auth/register`, { ...params });
  return response?.data;
};

export const verifyValidationEmail = async (code: string) => {
  try {
    const response = await api.post(
      `/auth/verify`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};

export const forgotPasswordEmail = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response?.data;
};

type TRecoveryParams = {
  token: string;
  new_password: string;
};

export const recoveryPassword = async (params: TRecoveryParams) => {
  const response = await api.post("/auth/reset-password", params);
  return response.data;
};

type TResendeCodeResponse = {
  detail?: string;
  message?: string;
};

export const resendVerificationCode = async () => {
  try {
    const response = await api.post<TResendeCodeResponse>(
      "/auth/resend-verification",
    );
    if (!response) return;
    return response.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};
