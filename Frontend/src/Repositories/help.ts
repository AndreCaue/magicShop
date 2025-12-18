import axios from "axios";

export type TViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

type TViaCepError = {
  erro: true;
};

export const getViaCep = async (cep: string) => {
  const response = await axios.get<TViaCepResponse>(
    `https://viacep.com.br/ws/${cep}/json/`
  );

  return response.data;
};
