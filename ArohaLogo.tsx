import React from "react";
import { View, Image, Text, StyleSheet, useColorScheme } from "react-native";

type Props = {
  size?: "small" | "medium" | "large";
  footer?: boolean;
};

const logoSource = require("@/assets/images/aroha-logo-transparent.png");

export default function ArohaLogo({ size = "medium", footer = false }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (footer) {
    return (
      <View style={styles.footerWrap}>
        <Image
          source={logoSource}
          style={styles.footerImage}
          resizeMode="contain"
        />
        <Text style={[styles.footerTagline, { color: isDark ? "rgba(255,255,255,0.18)" : "rgba(30,41,59,0.25)" }]}>
          Your mental health companion
        </Text>
      </View>
    );
  }

  const imageStyle =
    size === "large" ? styles.imageLarge :
    size === "small" ? styles.imageSmall :
    styles.imageMedium;

  return (
    <Image
      source={logoSource}
      style={imageStyle}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  imageSmall: { width: 80, height: 32 },
  imageMedium: { width: 120, height: 48 },
  imageLarge: { width: 160, height: 64 },
  footerWrap: {
    alignItems: "center",
    paddingVertical: 28,
    paddingBottom: 12,
    gap: 6,
  },
  footerImage: {
    width: 100,
    height: 40,
    opacity: 0.55,
  },
  footerTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
