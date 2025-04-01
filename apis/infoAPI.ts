import axios from "axios";
import Config from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SignupResponseSchema, updateMyInfoZod} from "@/constants/customTypes";
import { z } from "zod";

export type UpdateMyInfoType = z.infer<typeof updateMyInfoZod>;

export const getMyInfo = async () => {
  const token = await AsyncStorage.getItem("userToken");
  try {
    const response = await axios.get(`${Config.apiBaseUrl}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    //   console.log(JSON.stringify(response.data, null, 2))
    const parsed = SignupResponseSchema.parse(response.data);
    return parsed;
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

export const updateMyInfo = async (newInfo: UpdateMyInfoType) => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const response = await axios.post(`${Config.apiBaseUrl}/api/v1/users/me`, {
        ...newInfo
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //   console.log(JSON.stringify(response.data, null, 2))
      const parsed = SignupResponseSchema.parse(response.data);
      console.log("✅ Update My Info Success:", parsed);
      return parsed;
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