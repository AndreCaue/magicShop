import type { IOrderResponse } from "@/Pages/Checkout/types";
import api from "../../axiosInstance";
import axios from "axios";

export const getPaymentOrder = async ({
  order_uuid,
}: {
  order_uuid: string;
}) => {
  try {
    const response = await api.get<IOrderResponse>(`/orders/${order_uuid}`);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data;
    }

    throw err;
  }
};
