// utils/apiClient.js
import axios from "axios";
import Config from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignupResponse, SignupResponseSchema } from "@/constants/customTypes";
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
        },
      }
    );
    console.log(JSON.stringify(response));
    const result = response.data;
    if (!result.access_token || !result.token_type) throw new Error("incorrect result format");
    if (result.token_type === "bearer") {
      await AsyncStorage.setItem("userToken", result.access_token);
      console.log("token_set");
      return true;
    }
    return false;
  } catch (error) {
    let message = "Unknown error";
    if (axios.isAxiosError(error)) {
      message = error.response?.data?.detail || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
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
    console.log(JSON.stringify(response.data, null, 2))
    const parsed = SignupResponseSchema.parse(response.data);
    console.log("✅ Signup response is valid:", parsed);
    return parsed
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("❌ API Error:", JSON.stringify(error.response?.data));
    } else if (error instanceof z.ZodError) {
      console.error("❌ Validation Error:", error.errors);
    } else {
      console.error("❌ Unknown Error:", error);
    }
  }
};
