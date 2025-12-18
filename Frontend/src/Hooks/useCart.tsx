// src/hooks/useCart.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeFromCart, // ← agora importado
  clearCart, // ← agora importado
} from "../Repositories/shop/cart";
import type { Cart } from "@/global/cart";

export const useCart = () => {
  const queryClient = useQueryClient();

  // 1. Busca o carrinho
  const {
    data: cart,
    isLoading,
    isFetching,
  } = useQuery<Cart | null>({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 30_000, // 30 segundos
    refetchOnWindowFocus: true,
  });

  // Invalida a query do carrinho após qualquer mutação bem-sucedida
  const invalidateCart = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  // ---------- Mutações ----------
  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: invalidateCart,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItemQuantity({ product_id: itemId, quantity }),
    onSuccess: invalidateCart,
  });

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: invalidateCart,
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: invalidateCart,
  });

  // ---------- Ações expostas ----------
  const addToCartAction = (item: Parameters<typeof addToCart>[0]) => {
    addMutation.mutate(item);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartAction(itemId);
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

  // ---------- Helpers ----------
  const items = cart?.items ?? [];
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );

  const isMutating =
    addMutation.isPending ||
    updateQuantityMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending;

  return {
    // Dados do carrinho
    cart,
    items,
    totalItems,
    subtotal: subtotal.toFixed(2),

    // Estados
    isLoading,
    isFetching: isFetching && !isLoading,
    isMutating,

    // Ações (funções prontas para usar nos componentes)
    addToCart: addToCartAction,
    updateQuantity,
    removeFromCartAction,
    clearCart,
  };
};
