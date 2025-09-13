export type ReportType =
  | "damage_items"
  | "wrong_items"
  | "late_delivery"
  | "rider_behaviour"
  | "customer_behaviour"
  | "others";

type IssueStatus = "pending" | "investigating" | "resolved" | "dismissed";
type ReporTag = "complainant" | "defendant";

export type ReportedUserType = "vendor" | "customer" | "dispatch";

export type ReviewerType = "order" | "product";

export interface ReportCreate {
  order_id: string;
  description: string;
  report_type: ReportType;
  reported_user_type: ReportedUserType;
}

interface SenderInfo {
  name?: string;
  avatar?: string;
}

export interface MessageCreate {
  content: string;
}

export interface ThreadMessage {
  sender: SenderInfo;
  message_type: string;
  role: string;
  date: string;
  content: string;
  read: boolean;
}

export interface ReportResponse {
  id: string;
  complainant_id: string;
  description: string;
  report_status: IssueStatus;
  report_tag: ReporTag;
  report_type: ReportedUserType;
  created_at: string;
  is_read: boolean;
  thread: ThreadMessage[];
}

export interface ReportStatusUpdate {
  issue_status: IssueStatus;
}

export interface ReviewCreate {
  order_id?: string;
  item_id?: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  review_type: ReviewerType;
}

export interface ReviewCreateResponse {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewerProfile {
  id: string;
  full_name: string;
  profile_image_url: string;
}

export interface VendorReviewResponse {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: ReviewerProfile;
}
export interface ReviewsCount {
  reviews_count: number;
  average_rating: number
}

export interface BadgeCount {
  unread_count: number;
}
