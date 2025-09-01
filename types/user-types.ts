export const phoneRegEx =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

type Role =
  | "dispatch"
  | "rider"
  | "customer"
  | "restaurant_vendor"
  | "laundry_vendor";

type AccountStatus = "pending" | "confirmed";

export interface Bank {
  id: number;
  code: string;
  name: string;
}

export interface UserCoords {
    lat: number
    lng: number
}

interface Review {
  rating: string;
  comment: string;
  name: string;
  profile_image: string;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  email: string;
  phone_number: string;
  profile_image: string;
  location: string;
  backdrop_image_url: string;
  opening_hour: string;
  closing_hour: string;
  total_items: number;
  total_orders: number;
  rating: {
    average_rating: string;
    number_of_reviews: number;
  };
  category_id: string;
}

export type Login = {
  username: string;
  password: string;
};

export interface RiderProfile {
  profile_image_url?: string;
  full_name: string;
  email: string;
  phone_number: string;
  business_address: string;
  business_name: string;
  bike_number: string;
}

export interface Profile {
  user_id: string;
  full_name?: string;
  store_name?: string;
  phone_number: string;
  bank_name?: string;
  bank_account_number?: string;
  bike_number?: string;
  business_name?: string;
  business_registration_number?: string;
  business_address?: string;
  closing_hours?: string;
  opening_hours?: string;
  profile_image_url: string;
  backdrop_image_url: string;
}

export interface UserProfileUpdate {
  phoneNumber: string;
  companyRegNo?: string;
  location: string;
  companyName?: string;
  openingHour?: string;
  closingHour?: string;
  accountNumber: string;
  bankName: string;
  fullName?: string;
  storeName?: string;
}

type TransactionType =
  | "pay-with-wallet"
  | "fund-wallet"
  | "refund"
  | "user-to-user";
type TransactionDirection = "credit" | "debit";

export interface Transaction {
  id: string;
  wallet_id: string;
  to_wallet_id: string;
  created_at: string;
  amount: number;
  from_user: string;
  to_user: string;
  payment_link: string;
  payment_status: string;
  transaction_type: TransactionType;
  transaction_direction: TransactionDirection;
}
export interface Wallet {
  id: string;
  balance: number;
  escrow_balance: number;
  transactions: Transaction[];
}

export interface UserDetails {
  id: string;
  email: string;
  user_type: string;
  profile: Profile;
}

export interface CurrentUserDetails extends UserDetails {
  wallet: Wallet;
}

export interface User {
  account_status: AccountStatus;
  sub: string;
  user_type: Role;
  email: string;
  chat_token: string;
  access_token: string;
}

export interface RiderResponse {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  bike_number: string;
  profile_image_url: string;
  stats: {
    total_deliveries: number;
    pending_deliveries: number;
    completed_deliveries: number;
  };
}

export interface ImageUrl {
  profile_image_url?: string;
  backdrop_image_url?: string;
}

export interface RiderUpdate {
  fullName: string;
  phoneNumber: string;
  bikeNumber: string;
}
