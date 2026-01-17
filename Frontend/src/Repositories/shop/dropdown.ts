import api from "@/axiosInstance";

export const getCategoryDropdown = async () => {
  const response = await api.get("/dropdown/category");
  return response.data;
};

export const getShippingPresets = async () => {
  const res = await api.get("/dropdown/shipping-presets");
  return res.data;
};
