import api from "@/axiosInstance";

export const getListOfProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getIndividualProducts = async (id: number) => {
  const response = await api.get<IProduct>(`/products/${id}`);
  return response.data;
};

interface IGetShippingPresetsResponse {
  height_cm: number;
  id: number;
  length_cm: number;
  name: string;
  weight_grams: number;
  width_cm: number;
  discount?: number;
}

export const getShippingPresetsById = async (id?: number) => {
  const response = await api.get<IGetShippingPresetsResponse>(
    `/helpers/shipping-presets/${id}`
  );
  return response.data;
};
