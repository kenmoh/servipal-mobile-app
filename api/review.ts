import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";
import { ErrorResponse } from "./auth";
import {
  ReviewCreate,
  VendorReviewResponse,
  ReviewCreateResponse,
} from "@/types/review-types";

const REVIEW_BASE_URL = "/reviews";

// <<<<< ---------- REVIEW ---------- >>>>>
// Fetch reviews
export const fetchCurrentReviews = async (
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
