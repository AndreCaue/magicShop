import api from "@/axiosInstance";
import { handleErrorReq } from "@/helpers/generics";
import { toast } from "sonner";

export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

type TPostItemCart = {
  product_id: number;
  quantity: number;
};

export const addToCart = async (props: TPostItemCart) => {
  const response = await api.post<{ message: string }>("/cart/add", {
    ...props,
  });

  return response.data;
};

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_image_urls: string[];
  discount: number;
  height: number;
  width: number;
  weight: number;
  length: number;
}

interface Cart {
  id: number;
  user_id: string;
  status: string;
  items: CartItem[];
  discount: number | null;
  total: number;
}

export const updateCartItemQuantity = async ({
  product_id,
  quantity,
}: TPostItemCart) => {
  const response = await api.put<Cart>("/cart/update", {
    cart_item_id: product_id,
    quantity,
  });

  return response.data;
};

export const removeFromCart = async (cartId: number) => {
  const response = await api.delete("/cart/remove", {
    params: {
      cart_item_id: cartId,
    },
  });

  return response.data;
};

type TCreateOrderResponse = {
  message?: string;
  code?: string;
  redirect: string;
};

type TCreateOrderParams = {
  postal_code: string;
  shipping_option_id: number;
  usar_seguro?: number;
  cart_id: string | undefined;

  recipient_name: string;
  recipient_document: string;
  recipient_email: string;
  recipient_phone: string;

  street: string;
  number: string;
  complement: string | undefined;
  neighborhood: string;
  city: string;
  state: string;
};

export const createOrderCheckout = async (params: TCreateOrderParams) => {
  try {
    const response = await api.post<TCreateOrderResponse>("/cart/checkout", {
      ...params,
    });

    return response.data; // sucesso
  } catch (err: any) {
    const errorData = err.response?.data?.detail || err.response?.data;

    if (errorData?.code === "EMAIL_NOT_VERIFIED") {
      toast.warning(
        errorData.message || "Verifique seu e-mail antes de continuar.",
      );

      throw {
        code: "EMAIL_NOT_VERIFIED",
        message: errorData.message,
        isEmailVerificationError: true,
      };
    }

    handleErrorReq(err);
    throw err;
  }
};
