import {
  ReviewCreate,
  ReviewCreateResponse,
  ReviewsCount,
  VendorReviewResponse,
} from "@/types/review-types";
import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";
import { ErrorResponse } from "./auth";

const REVIEW_BASE_URL = "/reviews";

// <<<<< ---------- REVIEW ---------- >>>>>
// Fetch reviews
export const fetchVendorReviews = async (
  vendorId: string
): Promise<VendorReviewResponse[]> => {
  try {
    const response: ApiResponse<VendorReviewResponse[] | ErrorResponse> =
      await apiClient.get(`${REVIEW_BASE_URL}/${vendorId}/vendor-reviews`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching reviews.";
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

export const fetchProductReviews = async (
  productId: string
): Promise<VendorReviewResponse[]> => {
  try {
    const response: ApiResponse<VendorReviewResponse[] | ErrorResponse> =
      await apiClient.get(`${REVIEW_BASE_URL}/${productId}/item-reviews`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching reviews.";
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

export const fetchProductReviewsCount = async (
  productId: string
): Promise<ReviewsCount> => {
  try {
    const response: ApiResponse<ReviewsCount | ErrorResponse> =
      await apiClient.get(
        `${REVIEW_BASE_URL}/${productId}/item-reviews-count`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching reviews count.";
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

// Create Review
export const createReview = async (
  reviewData: ReviewCreate
): Promise<ReviewCreateResponse> => {
  const data = {
    order_id: reviewData.order_id,
    item_id: reviewData.item_id,
    reviewee_id: reviewData.reviewee_id,
    rating: reviewData.rating || "",
    comment: reviewData.comment,
    review_type: reviewData.review_type,
  };
  try {
    const response: ApiResponse<ReviewCreateResponse | ErrorResponse> =
      await apiClient.post(`${REVIEW_BASE_URL}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating review.";
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
// Create Review
export const createItemReview = async (
  reviewData: ReviewCreate
): Promise<ReviewCreateResponse> => {
  const data = {
    order_id: reviewData.order_id,
    item_id: reviewData.item_id,
    reviewee_id: reviewData.reviewee_id,
    rating: reviewData.rating || "",
    comment: reviewData.comment,
    review_type: reviewData.review_type,
  };
  try {
    const response: ApiResponse<ReviewCreateResponse | ErrorResponse> =
      await apiClient.post(`${REVIEW_BASE_URL}/item-review`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating review.";
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
