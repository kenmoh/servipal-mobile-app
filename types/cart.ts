export interface Food {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  quantity: number;
  side: string;
  ingredients: string;
  image_url: string;
}

export interface DeliveryOrder {
  foods: Food[];
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  origin_coords: [number | null, number | null];
  destination_coords: [number | null, number | null];
  additional_info: string;
}

export interface Laundry {
  id: string;
  laundry_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface LaundryOrder {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  additional_info: string;
  origin_coords: [number | null, number | null];
  destination_coords: [number | null, number | null];
  laundries: Laundry[];
}

export interface DeliveryInfo {
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  origin_coords: [number | null, number | null];
  destination_coords: [number | null, number | null];
  additional_info: string;
}



// types/cart.ts

export type OrderItem = {
  vendor_id: string;
  item_id: string;
  quantity: number;
  price: number;
};

export type CartDeliveryInfo = {
  pickup_coordinates: number[];
  dropoff_coordinates: number[];
  distance: number;
  require_delivery: "pickup" | "delivery";
  duration: string;
  origin: string;
  destination: string;
  additional_info?: string;
};

export type CartState = {
  order_items: OrderItem[];
  delivery_info: CartDeliveryInfo;
  totalCost: number;

  addItem: (item: Omit<OrderItem, "quantity"> & { price: number }) => void;
  removeItem: (item_id: string, vendor_id: string) => void;
  updateQuantity: (item_id: string, vendor_id: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryInfo: (info: Partial<CartDeliveryInfo>) => void;
  getPayload: () => {
    order_items: Omit<OrderItem, "price">[];
    totalCost: number;
  } & CartDeliveryInfo;
};
