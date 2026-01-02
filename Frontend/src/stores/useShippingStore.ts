// src/stores/useShippingStore.ts
import { create } from "zustand";

export interface ShippingOption {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  preco_com_desconto: number;
  prazo_dias: number;
}

interface ShippingState {
  cep: string;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  isFreeShipping: boolean;
  isCalculatingShipping: boolean; // Adicionado
  shippingError: string | null; // Adicionado (opcional, mas recomendado)

  // Getters
  getFormattedCep: () => string;

  // Actions
  setCep: (cep: string) => void;
  setShippingOptions: (options: ShippingOption[]) => void;
  setSelectedShipping: (option: ShippingOption | null) => void;
  setFreeShipping: (isFree: boolean) => void;
  setIsCalculatingShipping: (isCalculating: boolean) => void; // Adicionado
  setShippingError: (error: string | null) => void; // Adicionado
  clear: () => void;
}

export const useShippingStore = create<ShippingState>((set, get) => ({
  cep: "",
  shippingOptions: [],
  selectedShipping: null,
  isFreeShipping: false,
  isCalculatingShipping: false, // Inicializado
  shippingError: null, // Inicializado

  // Getter para CEP formatado
  getFormattedCep: () => {
    const state = get();
    return state.cep.length === 8
      ? state.cep.replace(/(\d{5})(\d{3})/, "$1-$2")
      : state.cep;
  },

  // Actions
  setCep: (cep) => set({ cep }),
  setShippingOptions: (options) => set({ shippingOptions: options }),
  setSelectedShipping: (option) => set({ selectedShipping: option }),
  setFreeShipping: (isFree) => set({ isFreeShipping: isFree }),
  setIsCalculatingShipping: (isCalculating) =>
    set({ isCalculatingShipping: isCalculating }),
  setShippingError: (error) => set({ shippingError: error }),
  clear: () =>
    set({
      cep: "",
      shippingOptions: [],
      selectedShipping: null,
      isFreeShipping: false,
      isCalculatingShipping: false,
      shippingError: null,
    }),
}));
