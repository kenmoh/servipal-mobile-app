import { ItemCreateBase, ItemImage, ItemType } from "./item-types";

export interface CreateProduct extends ItemCreateBase {
  stock: number;
  sizes: string;
  colors?: string[];
  description: string;
}
export interface CreateProductResponse extends CreateProduct {
  id: string;
  user_id: string;
  in_stock: boolean;
  category_id: string;
  store_name: string;
  total_sold: number;
  created_at: string;
  updated_at: string;
}

export interface ProductResponse {
  id: string;
  user_id: string;
  in_stock: boolean;
  category_id: string;
  store_name: string;
  total_sold: number;
  created_at: string;
  updated_at: string;
  name: string;
  stock: number;
  description: string;
  price: string;
  item_type?: ItemType;
  images: ItemImage[];
  sizes: string;
  colors: string[];
}

export interface OrderUpdateStatus {
  order_status: string;
}

export interface ProduductOrderResponse {
  id: string;
  user_id: string;
  vendor_id: string;
  order_type: string;
  order_number: string;
  order_payment_status:
    | "paid"
    | "pending"
    | "failed"
    | "cancelled"
    | "refunded";
  order_status: string;
  cancel_reason: string;
  total_price: string;
  amount_due_vendor: string;
  additional_info: string;
  payment_link: string;
  created_at: string;
  order_items: OrderItemProps[];
}

export interface BuyItem {
  quantity: number;
  colors?: string[];
  sizes?: string;
  additional_info: string;
}

export interface ImageProps {
  id: string;
  url: string;
  item_id: string;
}
interface OrderItem {
  id: string;
  user_id: string;
  name: string;
  price: string;
  colors: string[];
  sizes: string;
  images: ImageProps[];
}

interface OrderItemProps {
  item_id: string;
  user_id: string;
  name: string;
  price: string;
  quantity: number;
  colors: string[];
  sizes: string;
  images: ImageProps[];
  description: string;
}
export interface BuyItemResponse {
  id: string;
  user_id: string;
  vendor_id: string;
  order_type: string;
  order_number: string;
  cancel_reason: string;
  total_price: string;
  order_payment_status: string;
  amount_due_vendor: string;
  payment_link: string;
  description: string;
  quantity: number;
  order_items: OrderItem[];
}

export type ItemOrderStatus =
  | "pending"
  | "received"
  | "rejected"
  | "delivered"
  | "cancelled";
