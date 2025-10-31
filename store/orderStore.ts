import { create } from "zustand";

interface OrderStore {
  deliveryId: string | null;
  setDeliveryId: (deliveryId: string | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  deliveryId: null,
  setDeliveryId: (deliveryId) => set({ deliveryId }),
}));
