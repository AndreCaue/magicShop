import api from "../../axiosInstance";

type TGetShippingPrice = {
  cep_destino: string;
  peso_gramas: number;
  largura_cm: number;
  altura_cm: number;
  comprimento_cm: number;
  valor_declarado: number;
  cep_origem: string;
};

export const getShippingPrice = async (data: TGetShippingPrice) => {
  const response = api.post("/frete/cotar", { ...data });

  return response;
};
