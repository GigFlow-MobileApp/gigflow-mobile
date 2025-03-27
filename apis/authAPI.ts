import axios from "axios";
import Config from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignupResponseSchema } from "@/constants/customTypes";
import { z } from 'zod';

export const loginApi = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `${Config.apiBaseUrl}/api/v1/login/access-token`,
      new URLSearchParams({
        grant_type: "password",
        username,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          // Add origin header for development
          "Origin": "exp://192.168.104.149:8081" // Replace with your Expo development server URL
        },
      }
    );
    // console.log(JSON.stringify(response));
    const result = response.data;
    if (!result.access_token || !result.token_type) {
      return { success: false, error: "Incorrect response format from server" };
    }
    if (result.token_type === "bearer") {
      await AsyncStorage.setItem("userToken", result.access_token);
      console.log("token_set");
      return { success: true };
    }
    return { success: false, error: "Invalid token type" };
  } catch (error) {
    let message = "Unknown error occurred";
    if (axios.isAxiosError(error)) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        message = "Invalid email or password";
      } else if (error.response?.status === 422) {
        message = "Invalid input format";
      } else {
        message = error.response?.data?.detail || error.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
    return { 
      success: false, 
      error: typeof message === "string" ? message : JSON.stringify(message)
    };
  }
};

export const signupApi = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${Config.apiBaseUrl}/api/v1/users/signup`,{
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(JSON.stringify(response.data, null, 2))
    const parsed = SignupResponseSchema.parse(response.data);
    console.log("✅ Signup response is valid:", parsed);
    return { success: true, data: parsed };
  } catch (error) {
    let message = "Failed to create account";
    
    if (axios.isAxiosError(error)) {
      console.error("❌ API Error:", JSON.stringify(error.response?.data));
      // Handle specific error cases
      if (error.response?.status === 400) {
        message = error.response.data?.detail || "Email may already be registered";
      } else if (error.response?.status === 422) {
        message = "Invalid input format";
      } else {
        message = error.response?.data?.detail || error.message;
      }
    } else if (error instanceof z.ZodError) {
      console.error("❌ Validation Error:", error.errors);
      message = "Invalid response format from server";
    } else {
      console.error("❌ Unknown Error:", error);
    }
    
    return { success: false, error: message };
  }
};
