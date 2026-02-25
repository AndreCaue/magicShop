import api from "@/axiosInstance";

export const getCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

type TPostItemCart = {
  product_id: number;
  quantity: number;
};

export const addToCart = async (props: TPostItemCart) => {
  const response = await api.post<any>("/cart/add", { ...props }); // falta tipar

  return response.data;
};

export const updateCartItemQuantity = async ({
  product_id,
  quantity,
}: TPostItemCart) => {
  const response = await api.put<any>("/cart/update", {
    // falta tipar
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

export const clearCart = async () => {
  const response = await api.put<any>("/"); // falta tipar
  return response.data;
};

type TCreateOrderResponse = {
  message: string;
  redirect: string;
};

type TCreateOrderParams = {
  postal_code: string;
  shipping_option_id: number;
  usar_seguro?: number;

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
  const response = await api.post<TCreateOrderResponse>("/cart/checkout", {
    ...params,
  });

  return response.data;
};
