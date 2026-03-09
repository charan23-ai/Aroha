import { useEffect } from "react";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

export default function Index() {
  const { profile, isLoaded } = useApp();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (!isLoaded) return;
    if (profile?.onboardingComplete) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoaded, profile]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? Colors.dark.background : Colors.light.background }}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}
