import api from "@/axiosInstance";
import { handleErrorReq } from "@/helpers/generics";
import type { TOrderStatus } from "@/Pages/Admin/Pedidos/Components/components";

export type TAdminOrderItem = {
  id: number;
  name: string;
  image?: string | null;
  qty: number;
  unit_price: number;
  total_price: number;
  product_id: number;
};

export type TAdminOrderShipping = {
  recipient_name: string;
  recipient_document: string;
  recipient_phone: string;
  recipient_email: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
};

export type TAdminOrderRefund = {
  id: number;
  status: string;
  created_at: string;
};

export type TAdminOrder = {
  id: string;
  short_id: string;
  status: TOrderStatus;
  payment_status: string;
  payment_method?: string | null;
  paid_at?: string | null;
  subtotal: number;
  total: number;
  shipping_cost: number;
  shipping_discount: number;
  shipping_original: number;
  shipping_carrier: string;
  shipping_method: string;
  shipping_delivery_days: number;
  shipping_service_id?: number | null;
  melhorenvio_cart_id?: string | null;
  melhorenvio_order_id?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at: string;
  items: TAdminOrderItem[];
  shipping?: TAdminOrderShipping | null;
  refunds: TAdminOrderRefund[];
};

export type TAdminOrdersResponse = {
  data: TAdminOrder[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
};

export const getAdminOrdersList = async (page = 1) => {
  try {
    const { data } = await api.get<TAdminOrdersResponse>("/orders/list/admin", {
      params: {
        page,
        page_size: 10,
      },
    });
    return data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};

export const buyLabel = async (order_uuid: string) => {
  try {
    const { data } = await api.post(`/orders/${order_uuid}/checkout`);
    return data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};

export const getAdminOrderDetails = async (
  orderId: string,
): Promise<TAdminOrder> => {
  try {
    const { data } = await api.get<TAdminOrder>(`/orders/admin/${orderId}`);

    return data;
  } catch (err) {
    handleErrorReq(err);
    throw err;
  }
};
