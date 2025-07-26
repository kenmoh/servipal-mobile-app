export type ItemType = "food" | "package" | "product" | "laundry";
export type FoodGroup = "appetizer" | "main_course" | "dessert" | "others";

export interface Review {
  item_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
    profile_image: string;
  };
}

export interface ItemImage {
  id: string;
  item_id: string;
  url: string;
}

interface ItemCreateBase {
  name: string;
  description?: string;
  price: number;
  itemType: ItemType;
  category_id?: string;
  images: ItemImage[];
}
export interface CreateItem extends ItemCreateBase {
  colors?: string[];
  sizes?: string;
  stock?: number;
}
export interface ItemResponse extends CreateItem {
  id: string;
  user_id: string;
}

export interface ItemResponse extends CreateItem {
  id: string;
  user_id: string;
}
export interface CreateMenuItmItem extends ItemCreateBase {
  side?: string;
  food_group?: FoodGroup;
}
export interface RestaurantMenuResponse extends ItemCreateBase {
  id: string;
  user_id: string;
  food_group: FoodGroup;
}
export interface LaundryMenuResponse extends ItemCreateBase {
  id: string;
  user_id: string;
}

export type CombinedResponse = RestaurantMenuResponse | LaundryMenuResponse;

export interface CreateCategory {
  name: string;
}
export interface CategoryResponse extends CreateCategory {
  id: string;
  category_type: "food" | "product";
}

interface MenuBase {
  id: string;
  name: string;
  item_type: string;
  price: string;
  images: ItemImage[];
}

export interface MenuItem extends MenuBase {
  user_id: string;
  description?: string;
}

export interface LaundryMenuItem extends MenuBase {
  user_id: string;
}
