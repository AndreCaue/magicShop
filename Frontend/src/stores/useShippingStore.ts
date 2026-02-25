import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ShippingOption {
  id: string;
  nome: string;
  empresa: string;
  preco: number;
  preco_com_desconto: number;
  prazo_dias: number;
  empresa_picture?: string;
}

interface ShippingState {
  cep: string;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  isFreeShipping: boolean;
  isCalculatingShipping: boolean;
  shippingError: string | null;

  getFormattedCep: () => string;

  setCep: (cep: string) => void;
  setShippingOptions: (options: ShippingOption[]) => void;
  setSelectedShipping: (option: ShippingOption | null) => void;
  setFreeShipping: (isFree: boolean) => void;
  setIsCalculatingShipping: (isCalculating: boolean) => void;
  setShippingError: (error: string | null) => void;
  clear: () => void;
}

export const useShippingStore = create<ShippingState>()(
  persist(
    (set, get) => ({
      cep: "",
      shippingOptions: [],
      selectedShipping: null,
      isFreeShipping: false,

      isCalculatingShipping: false,
      shippingError: null,

      getFormattedCep: () => {
        const { cep } = get();
        return cep.length === 8 ? cep.replace(/(\d{5})(\d{3})/, "$1-$2") : cep;
      },

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
        }),
    }),
    {
      name: "shipping-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        cep: state.cep,
        shippingOptions: state.shippingOptions,
        selectedShipping: state.selectedShipping,
        isFreeShipping: state.isFreeShipping,
      }),
    },
  ),
);
