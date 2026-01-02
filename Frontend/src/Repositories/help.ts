import api from "@/axiosInstance";
import type { TUF } from "@/helpers/estados";

export type TViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: TUF;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

export const getViaCep = async (cep: string) => {
  const response = await api.get<TViaCepResponse>(`/cep/${cep}`);

  return response.data;
};
