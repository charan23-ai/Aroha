import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="untangle">
        <Icon sf={{ default: "wind", selected: "wind" }} />
        <Label>Untangle</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tracking">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Tracking</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="mindkit">
        <Icon sf={{ default: "heart", selected: "heart.fill" }} />
        <Label>MindKit</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? Colors.dark.surface : Colors.light.surface,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }]} />
          ) : null,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="house.fill" tintColor={color} size={size} /> : <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="untangle"
        options={{
          title: "Untangle",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="wind" tintColor={color} size={size} /> : <Ionicons name="partly-sunny" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: "Tracking",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="chart.bar.fill" tintColor={color} size={size} /> : <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mindkit"
        options={{
          title: "MindKit",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="heart.fill" tintColor={color} size={size} /> : <Ionicons name="heart" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
