// app/main/settings/setting/index.tsx
import { useRouter } from "expo-router";
import { TouchableOpacity, View, ScrollView} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useState, useEffect } from "react";
import PressableCard from "@/components/ui/PressableCard";
import ConnectAccount from "@/components/model/ConnectAccount";
import BottomSheet from "@/components/Dialog";

interface ConnectAccountProps {
    onClose: () => void;
  }

export default function AccountSheet({ 
    onClose
}: ConnectAccountProps) {
  const {colors} = useThemeColors();
  const [showConnectAccount, setShowConnectAccount] = useState(false);
//   const router = useRouter();

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="h-12 mt-3 mb-2 relative justify-center items-center">
        <TouchableOpacity
          onPress={onClose}
          className="absolute left-4 h-10 w-10 justify-center items-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <ThemedText
          colorValue="primaryText"
          type="title"
          className="text-center"
        >
          Settings
        </ThemedText>
      </View>
      {/* Divider */}
      <View
        className="w-full h-[1.5px]"
        style={{ backgroundColor: colors.divider }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View className="mt-6 mx-5">
          <ThemedText
            type="defaultSemiBold"
            colorValue="primaryText"
            style={{ fontFamily: "Poppins", height: 26 }}
          >
            Your Accounts
          </ThemedText>
          <View className="flex-row justify-between mt-4">
            {/* Accounts */}
            <View className="flex-1">
              <PressableCard onPress={() => setShowConnectAccount(true)}>
                <View className="flex-row justify-between items-center">
                  <IconSymbol name="grid" size={32} color={colors.cardText} />
                  <View className="flex-col">
                    <ThemedText
                      className="text-center ml-2"
                      colorValue="cardText"
                      type="defautlSmall"
                      style={{ fontWeight: 700, height: 22 }}
                    >
                      Accounts
                    </ThemedText>
                    <ThemedText
                      className="text-center ml-1"
                      colorValue="cardText"
                      type="semiSmall"
                      style={{ height: 20 }}
                    >
                      Connected Account
                    </ThemedText>
                  </View>
                </View>
              </PressableCard>
            </View>
            <View className="w-3" />
            {/* Profile */}
            <View className="flex-1">
              <PressableCard>
                <View className="flex-row justify-between items-center">
                  <IconSymbol
                    name="person"
                    size={32}
                    color={colors.cardText}
                  />
                  <View className="flex-col ml-2">
                    <ThemedText
                      colorValue="cardText"
                      type="defautlSmall"
                      style={{ fontWeight: 700, height: 22 }}
                    >
                      Profile
                    </ThemedText>
                    <ThemedText
                      colorValue="cardText"
                      type="semiSmall"
                      style={{ height: 20 }}
                    >
                      Your Profile
                    </ThemedText>
                  </View>
                </View>
              </PressableCard>
            </View>
          </View>
        </View>
        {/* Financial Management Section */}
        <View className="mt-6 mx-5">
          <ThemedText
            type="defaultSemiBold"
            colorValue="primaryText"
            style={{ fontFamily: "Poppins", height: 26 }}
          >
            Financial Management
          </ThemedText>
          <View className="flex-row justify-between mt-4">
            {/* Payout */}
            <View className="flex-1">
              <PressableCard>
                <View className="flex-col justify-between items-center">
                  <IconSymbol
                    name="coins"
                    size={32}
                    color={colors.cardText}
                  />
                  <ThemedText
                    colorValue="cardText"
                    type="defautlSmall"
                    style={{ fontWeight: 700, marginTop: 8 }}
                  >
                    Payout
                  </ThemedText>
                  <ThemedText
                    colorValue="textTertiary"
                    type="semiSmall"
                    style={{ textAlign: "center", marginTop: 4 }}
                  >
                    Check current available balance and payout
                  </ThemedText>
                </View>
              </PressableCard>
            </View>
            <View className="w-3" />
            {/* Payment History */}
            <View className="flex-1">
              <PressableCard>
                <View className="flex-col items-center">
                  <IconSymbol
                    name="person"
                    size={32}
                    color={colors.cardText}
                  />
                  <ThemedText
                    colorValue="cardText"
                    type="defautlSmall"
                    style={{ fontWeight: 700, marginTop: 8 }}
                  >
                    Payment History
                  </ThemedText>
                  <ThemedText
                    colorValue="textTertiary"
                    type="semiSmall"
                    style={{ textAlign: "center", marginTop: 4 }}
                  >
                    Check all history from your connectd account
                  </ThemedText>
                </View>
              </PressableCard>
            </View>
          </View>
        </View>
        {/*Settings */}
        <View className="mt-6 mx-5 pb-10">
          <ThemedText
            type="defaultSemiBold"
            colorValue="primaryText"
            style={{ fontFamily: "Poppins", height: 26 }}
          >
            Settings
          </ThemedText>
          <View className="flex-row justify-between mt-4">
            {/* System Settings */}
            <View className="flex-1">
              <PressableCard>
                <View className="flex-row justify-start items-center ml-2">
                  <IconSymbol name="gear" size={24} color={colors.cardText} />
                  <ThemedText colorValue="cardText" type="btnText" className="ml-4">
                    System Settings
                  </ThemedText>
                </View>
              </PressableCard>
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomSheet visible={showConnectAccount} onClose={() => setShowConnectAccount(false)} height={0.95}>
        <ConnectAccount onSubmit={() => ""} onClose={() => setShowConnectAccount(false)}/>
      </BottomSheet>
    </View>
  );
}

// How to use

// import AccountSheet from "@/components/model/AccountSheet";
// import BottomSheet from "@/components/Dialog";
// const [showSheet, setShowSheet] = useState<boolean>(true);

// <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)}>
//   <AccountSheet onClose={() => setShowSheet(false)}/>
// </BottomSheet>
