import { handleErrorReq } from "@/helpers/generics";
import api from "../../axiosInstance";

type CarrinhoItem = {
  product_id: number;
  quantity: number;
};

type TGetShippingPrice = {
  itens: CarrinhoItem[];
  cep_destino: string;
  valor_declarado: number;
  cep_origem?: string;
};

type ShippingOption = {
  id: string;
  nome: string;
  empresa: string;
  empresa_picture: string;
  preco: number;
  preco_com_desconto: number;
  prazo_dias: number;
  entrega_domiciliar: boolean;
  entrega_sabado: boolean;
  peso_gramas: number;
  largura_cm: number;
  altura_cm: number;
  comprimento_cm: number;
};

export const getShippingPrice = async (
  data: TGetShippingPrice,
): Promise<ShippingOption[]> => {
  try {
    const response = await api.post("/melhor-envio/cotar", data);
    return response.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};

type TCreateCarteME = {
  shipment_id: string;
  status: string;
  price: number;
  delivery_time: number;
};

export const createCartMelhorEnvio = ({
  order_uuid,
}: {
  order_uuid: string;
}) => {
  try {
    const res = api.post<{ data: TCreateCarteME }>(
      "/melhor-envio/registrar-envio",
      { order_uuid },
    );
    return res;
  } catch (err) {
    console.log(err, "erro");
    handleErrorReq(err);
    throw err;
  }
};

export type TCartMEResponse = {
  id: string;
  to: { name: string };
};

export const getCartME = async () => {
  try {
    const res = await api.get<TCartMEResponse[]>("/melhor-envio/carrinho");
    return res.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};

export const removeItemCartMEById = async ({
  order_uuid,
}: {
  order_uuid: string;
}) => {
  try {
    const res = await api.delete<TCartMEResponse[]>(
      `/melhor-envio/carrinho/del/${order_uuid}`,
    );
    return res.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};
