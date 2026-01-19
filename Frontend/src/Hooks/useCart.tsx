import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../Repositories/shop/cart";
import type { Cart } from "@/global/cart";

export const useCart = () => {
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isFetching,
  } = useQuery<Cart | null>({
    queryKey: ["cart"],
    queryFn: async () => {
      console.log("🔄 Executando getCart...");
      const result = await getCart();
      console.log("✅ getCart resultado:", result);
      return result;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const invalidateCart = async () => {
    console.log("🔃 Invalidando cart...");
    await queryClient.invalidateQueries({ queryKey: ["cart"] });
    console.log("✅ Cart invalidado");
  };

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (response) => {
      queryClient.setQueryData(["cart"], response.cart);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItemQuantity({ product_id: itemId, quantity }),
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: async () => {
      await invalidateCart();
    },
  });

  const addToCartAction = (item: Parameters<typeof addToCart>[0]) => {
    addMutation.mutate(item);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeMutation.mutate(itemId);
    } else {
      updateQuantityMutation.mutate({ itemId, quantity });
    }
  };

  const removeFromCartAction = (itemId: number) => {
    removeMutation.mutate(itemId);
  };

  const clearCartAction = () => {
    clearMutation.mutate();
  };

  const items = cart?.items ?? [];
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0,
  );

  const isMutating =
    addMutation.isPending ||
    updateQuantityMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending;

  return {
    cart,
    items,
    totalItems,
    subtotal: subtotal.toFixed(2),
    isLoading,
    isFetching: isFetching && !isLoading,
    isMutating,
    addToCart: addToCartAction,
    updateQuantity,
    removeFromCartAction,
    clearCart: clearCartAction, // ✅ Corrigido
  };
};
