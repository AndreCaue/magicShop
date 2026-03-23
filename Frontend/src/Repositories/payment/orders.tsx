import type { IOrderResponse } from "@/Pages/Checkout/types";
import api from "../../axiosInstance";
import axios from "axios";
import { toast } from "sonner";
import { handleErrorReq } from "@/helpers/generics";

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

export type TGetOrderIfHas = {
  message: string;
  redirect: string;
  success: boolean;
  expires_at: number;
};

export const getOrderIfHas = async () => {
  try {
    const response = await api.get<TGetOrderIfHas>("/orders/by-user");

    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return null;
    }

    if (err instanceof Error) {
      toast.error(`Unexpected error :( ${err.message}`);
      return null;
    }

    return null;
  }
};

type OrderItem = {
  name: string;
  qty: number;
  price: number;
  order_item_id: number;
};

export type TGetUserOrderList = {
  id: string;
  short_id: string;
  status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  date: string;
  shipping_carrier: string;
  recipient_name: string;
  payment_method?: "PIX" | "CREDIT_CARD";
};

export const getUserOrderList = async () => {
  try {
    const response = await api.get<TGetUserOrderList[]>("/orders/list");

    return response.data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};
