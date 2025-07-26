import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";

export interface RecoverPassword {
  email: string;
}
export interface ResetPassword {
  token: string;
  newPassword: string;
}
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
export interface LoginSuccessResponse {
  access_token: string;
  token_type: string;
}

export interface Contact {
  emailCode: string;
  phoneCode: string;
}

export interface Register {
  email: string;
  phoneNumber: string;
  userType: string;
  password: string;
}
export interface RegisterRider {
  email: string;
  phoneNumber: string;
  bikeNumber: string;
  fullName: string;
  password: string;
}
export interface RegisterResponse {
  email: string;
  phoneNumber: string;
  userType?: string;
}
export interface ErrorResponse {
  detail: string;
}

interface LoginErrorResponse {
  detail: string;
}
export const loginApi = async (
  username: string,
  password: string
): Promise<LoginSuccessResponse> => {
  const data = new FormData();
  data.append("username", username.trim());
  data.append("password", password.trim());

  const response: ApiResponse<LoginSuccessResponse | LoginErrorResponse> =
    await apiClient.post("/auth/login", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

  if (!response.ok || !response.data || "detail" in response.data) {
    const errorMessage =
      response.data && "detail" in response.data
        ? response.data.detail.split(":")[1]
        : "Something went wrong. Please try again.";
    throw new Error(errorMessage);
  }

  return response.data;
};

export const logOutUser = async (): Promise<void> => {
  const response: ApiResponse<void | LoginErrorResponse> = await apiClient.post(
    "/auth/logout",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok || !response.data || "detail" in response.data) {
    const errorMessage =
      response.data && "detail" in response.data
        ? response.data.detail.split(":")[1]
        : "Something went wrong. Please try again.";
    throw new Error(errorMessage);
  }
};

// User registration
export const registerApi = async (
  userData: Register
): Promise<RegisterResponse> => {
  const reqData = {
    email: userData.email.toLowerCase().trim(),
    user_type: userData.userType,
    phone_number: userData.phoneNumber,
    password: userData.password,
  };

  try {
    const response: ApiResponse<RegisterResponse | ErrorResponse> =
      await apiClient.post("/auth/register", reqData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred during registration");
  }
};

// Rider registration
export const registerRiderApi = async (
  userData: RegisterRider
): Promise<RegisterResponse> => {
  const data = {
    full_name: userData.fullName,
    email: userData.email,
    password: userData.password,
    bike_number: userData.bikeNumber,
    phone_number: userData.phoneNumber,
  };
  try {
    const response: ApiResponse<RegisterRider | ErrorResponse> =
      await apiClient.post("/auth/register-rider", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred during registration");
  }
};

// Verify contact
export const verifyContact = async (userData: Contact): Promise<Contact> => {
  const reqData = {
    email_code: userData.emailCode,
    phone_code: userData.phoneCode,
  };

  try {
    const response: ApiResponse<Contact | ErrorResponse> = await apiClient.post(
      "/auth/verify-contacts",
      reqData,
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
          : "Account verification failed. Please try again.";
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

// Recover password(Get link)
export const recoverPassword = async (
  data: RecoverPassword
): Promise<RecoverPassword> => {
  const reqData = {
    email: data.email,
  };

  try {
    const response: ApiResponse<RecoverPassword | ErrorResponse> =
      await apiClient.post("/auth/recover-password", reqData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Failed to send recovery link. Please try again.";
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

// Reset Password(Set new password from link)
export const resetPassword = async (
  data: ResetPassword
): Promise<ResetPassword> => {
  const reqData = {
    token: data.token,
    new_password: data.newPassword,
  };

  try {
    const response: ApiResponse<ResetPassword | ErrorResponse> =
      await apiClient.post("/auth/reset-password", reqData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Reset password failed. Please try again.";
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
// Change Password(Set new password from link)
export const changePassword = async (
  data: ChangePassword
): Promise<ChangePassword> => {
  const reqData = {
    current_password: data.currentPassword,
    new_password: data.newPassword,
  };

  try {
    const response: ApiResponse<ChangePassword | ErrorResponse> =
      await apiClient.post("/auth/reset-password", reqData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Failed to chnage password. Please try again.";
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
// Resend verification code after 1 minute
export const resendVerification = async (email: string) => {
  try {
    await apiClient.put(
      `/auth/resend-verification?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred.");
  }
};
