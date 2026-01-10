import api from "@/axiosInstance";

export const getBranchDropdown = async () => {
  const response = await api.get("/dropdown/branch");
  return response.data;
};

export const getShippingPresets = async () => {
  const res = await api.get("/dropdown/shipping-presets");
  return res.data;
};
