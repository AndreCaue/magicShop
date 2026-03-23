import api from "@/axiosInstance";
import { handleErrorReq } from "@/helpers/generics";

type TItemRefund = {
  order_item_id: number;
  qty: number;
};

type TCreateRefundRequest = {
  order_uuid: string;
  reason_code: string;
  description?: string;
  items?: TItemRefund[];
};

export const createRefundRequest = async (params: TCreateRefundRequest) => {
  try {
    const res = await api.post("/refunds", { ...params });

    return res.data;
  } catch (err) {
    handleErrorReq(err);
  }
};
