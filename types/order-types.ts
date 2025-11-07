export type Coordinates = [number | null, number | null];
export type OrderType = "package" | "food" | "laundry" | "product";
export type OrderStatus =
  | "pending"
  | "in-transit"
  | "delivered"
  | "received"
  | "laundry_pickup"
  | "laundry_returned";
export type RequireDelivery =
  | "pickup"
  | "delivery"
  | "vendor-pickup-and-dropoff";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type RiderDeliveryStatus = "in transit" | "delivered" | "cancelled";
export type SenderDeliveryStatus = "received";
export type LaundryDeliveryStatus = "laundry received";

export type DeliveryStatus =
  | "accepted"
  | "pending"
  | "delivered"
  | "received"
  | "laundry_received"
  | "cancelled"
  | "in-transit"
  | "picked-up";

export interface ImageType {
  url: string;
  type: string;
  name: string;
}
export interface SendItem {
  name: string;
  riderId: string;
  description: string;
  origin: string;
  destination: string;
  duration: string;
  pickup_coordinates: Coordinates;
  dropoff_coordinates: Coordinates;
  distance: number;
  imageUrl: string;
}

export interface UpdateDeliveryLocation {
  rider_id: string;
  message?: string;
  last_known_rider_coordinates: Coordinates;
}

interface Delivery {
  id: string;
  delivery_type: OrderType;
  delivery_status: DeliveryStatus;
  sender_id: string;
  vendor_id: string;
  rider_id: string;
  sender_phone_number: string;
  rider_phone_number: string;
  dispatch_id: string;
  distance: string;
  origin?: string;
  duration?: string;
  destination?: string;
  delivery_fee: string;
  amount_due_dispatch: string;
  created_at: string;
  pickup_coordinates?: Coordinates;
  dropoff_coordinates?: Coordinates;
  last_known_rider_coordinates?: Coordinates;
}

export interface OrderItemResponse {
  id: string;
  user_id: string;
  name: string;
  price: string;
  description: string;
  quantity: 0;
  images: ImageType[];
}

export interface OrderResponse {
  id: string;
  user_id: string;
  owner_id: string;
  vendor_id: string;
  order_type: OrderType;
  order_number: string;
  require_delivery: "pickup" | "delivery" | "vendor-pickup-and-dropoff";
  is_one_way_delivery: boolean;
  total_price: string;
  vendor_pickup_dropoff_charge: string;
  order_payment_status: PaymentStatus;
  order_status: OrderStatus;
  amount_due_vendor: string;
  business_name: string;
  payment_link: string;
  created_at: string;
  order_items: OrderItemResponse[];
}

export interface DeliveryDetail {
  delivery?: Delivery;
  order: OrderResponse;
  distance?: number;
}

interface OrderItem {
  vendor_id: string;
  item_id: string;
  quantity: number;
}

export interface OrderFoodOLaundry {
  order_items: OrderItem[];
  pickup_coordinates?: [number, number] | [null, null];
  dropoff_coordinates?: [number, number] | [null, null];
  distance?: number;
  require_delivery: RequireDelivery;
  duration?: string;
  origin?: string;
  destination?: string;
  additional_info?: string;
  is_one_way_delivery: boolean;
}

export interface OrderLaundry {
  order_items: OrderItem[];
  pickup_location?: string;
  require_delivery: RequireDelivery;
  additional_info?: string;
}

export interface CreateReview {
  rating: number;
  comment: string;
}
