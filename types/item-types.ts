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

export interface ItemCreateBase {
  name: string;
  description?: string;
  price: number;
  itemType?: ItemType | string;
  category_id?: string;
  images: ItemImage[];
}

export interface CreateMenuItmItem {
  name: string;
  description?: string;
  price: number;
  itemType?: ItemType | string;
  category_id?: string;
  images: ItemImage[];
  side?: string;
  foodGroup: string;
}
export interface UpdateMenuItmItem extends CreateMenuItmItem {}
export interface ItemMenuResponse extends CreateMenuItmItem {
  id: string;
  user_id: string;
  item_type: ItemType;
  category_name: string;
  // food_group: FoodGroup;
}

export interface LaundryMenuResponse extends ItemCreateBase {
  id: string;
  user_id: string;
}

// export type CombinedResponse = RestaurantMenuResponse | LaundryMenuResponse;

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
  category_id?: string;
  price: string;
  images: ItemImage[];
}

export interface MenuItem extends MenuBase {
  user_id: string;
  description?: string;
  food_group: FoodGroup;
}

export interface LaundryMenuItem extends MenuBase {
  user_id: string;
}
