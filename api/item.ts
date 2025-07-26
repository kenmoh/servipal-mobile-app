import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";
import { ErrorResponse } from "./auth";
import {
  CategoryResponse,
  CombinedResponse,
  CreateCategory,
  CreateItem,
  CreateMenuItmItem,
  ItemResponse,
  MenuItem,
} from "@/types/item-types";

const BASE_URL = "/items";

// Fetch categories
export const fetchCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response: ApiResponse<CategoryResponse[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/categories`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching categories.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Create Category
export const createCategory = async (
  catData: CreateCategory
): Promise<CategoryResponse> => {
  const data = {
    name: catData.name,
  };
  try {
    const response: ApiResponse<CategoryResponse | ErrorResponse> =
      await apiClient.post(`${BASE_URL}/categories`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating category.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Create Item
export const createMenuItem = async (
  itemData: CreateMenuItmItem
): Promise<CombinedResponse> => {
  const data = new FormData();

  data.append("name", itemData.name);
  data.append("price", itemData.price.toString());
  data.append("item_type", itemData.itemType);
  if (itemData.category_id) {
    data.append("category_id", itemData.category_id);
  }
  if (itemData.food_group) {
    data.append("food_group", itemData.food_group);
  }
  if (itemData.side) {
    data.append("side", itemData.side);
  }
  if (itemData.description) {
    data.append("description", itemData.description);
  }

  // Handle images
  const imagesArray = Array.isArray(itemData.images) ? itemData.images : [];

  if (imagesArray.length > 0) {
    imagesArray.forEach((imagePath, index) => {
      const imageData = {
        uri: imagePath,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      };
      data.append("images", imageData as any);
    });
  }
  try {
    const response: ApiResponse<CombinedResponse | ErrorResponse> =
      await apiClient.post(`${BASE_URL}/menu-item-create`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating item. Please try again later.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Update Item
export const updateItem = async (
  itemId: string,
  itemData: CreateItem
): Promise<ItemResponse> => {
  const data = new FormData();
  data.append("name", itemData.name);
  data.append("price", itemData.price.toString());
  if (itemData.category_id !== undefined) {
    data.append("category_id", itemData.category_id);
  }
  if (itemData.description) {
    data.append("description", itemData.description);
  }
  // Handle multiple images
  if (itemData.images && itemData.images.length > 0) {
    itemData.images.forEach((image, index) => {
      data.append("images", {
        uri: image.url,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      } as any);
    });
  }
  try {
    const response: ApiResponse<ItemResponse | ErrorResponse> =
      await apiClient.put(`/items/${itemId}/update`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error updating item. Please try again later.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Fetch Item
export const fetchItem = async (itemId: string): Promise<ItemResponse> => {
  try {
    const response: ApiResponse<ItemResponse | ErrorResponse> =
      await apiClient.get(`/items/${itemId}/item`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching item.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Delete Item
export const deleteItem = async (itemId: string): Promise<ItemResponse> => {
  try {
    const response: ApiResponse<ItemResponse | ErrorResponse> =
      await apiClient.delete(`/items/${itemId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error deleting item.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
