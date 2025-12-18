import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia o cookie HttpOnly automaticamente
});

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

type TPostItemCart = {
  product_id: number;
  quantity: number;
};

export const addToCart = async (props: TPostItemCart) => {
  const response = await api.post<IResMessage>("/cart/add", { ...props });

  return response.data;
};

export const updateCartItemQuantity = async ({
  product_id,
  quantity,
}: TPostItemCart) => {
  const response = await api.put<any>("/cart/update", {
    cart_item_id: product_id,
    quantity,
  }); // parei aqui

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
  const response = await api.put<any>("/");
  return response.data;
};
