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
  total_sold: number;
  created_at: string;
  updated_at: string;
}

// {
//     "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "total_sold": 0,
//     "name": "string",
//     "description": "string",
//     "price": "string",
//     "stock": 0,
//     "category_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "sizes": "string",
//     "colors": [],
//     "in_stock": true,
//     "images": [
//       {
//         "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//         "url": "string",
//         "item_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
//       }
//     ],
//     "created_at": "2025-08-05T17:32:05.192Z",
//     "updated_at": "2025-08-05T17:32:05.192Z"
//   }

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
