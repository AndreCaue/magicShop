import api from "@/axiosInstance";

type TGetProductResponse = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  category_id: number;
  shipping_preset_id: number;
  weight_grams: number;
  height_cm: number;
  width_cm: number;
  length_cm: number;
  discount: number;
  id: number;
  category: {
    name: string;
    description: string;
    website: string;
    logo_url: string;
    id: number;
  };
};

export const getListOfProducts = async () => {
  const response = await api.get<TGetProductResponse[]>("/products");
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
    `/helpers/shipping-presets/${id}`,
  );
  return response.data;
};
