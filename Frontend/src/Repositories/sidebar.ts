import api from "@/axiosInstance";
import { handleErrorReq } from "@/helpers/generics";

export const getSidebarOptions = async () => {
  try {
    const res = await api.get("/sidebar");

    return res.data;
  } catch (err: unknown) {
    handleErrorReq(err);
  }
};
