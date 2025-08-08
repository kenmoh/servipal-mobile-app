import { ItemCreateBase } from "./item-types";

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

export interface BuyItem {
  quantity: number;
  colors?: string[];
  sizes?: string;
  additional_info: string;
}

interface Image {
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
  images: Image[];
}
export interface BuyItemResponse {
  id: string;
  user_id: string;
  vendor_id: string;
  order_type: string;
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
