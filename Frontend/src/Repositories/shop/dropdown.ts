import api from "@/axiosInstance";
import { handleErrorReq, type IDropdownOption } from "@/helpers/generics";

export const getCategoryDropdown = async () => {
  const response = await api.get("/dropdown/category");
  return response.data;
};

export const getShippingPresets = async () => {
  const res = await api.get("/dropdown/shipping-presets");
  return res.data;
};

type TGetRefundReasons = IDropdownOption & {
  id: number;
  code?: string;
};

export const getRefundReasons = async () => {
  const res = await api.get<TGetRefundReasons[]>("/dropdown/refund-reasons");
  return res.data;
};

export const getListOfProducts = async () => {
  try {
    const response =
      await api.get<[{ name: string; id: number }]>("/products/options");
    return response.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};
