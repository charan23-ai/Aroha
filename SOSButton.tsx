import React, { useRef } from "react";
import { Pressable, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function SOSButton() {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.push("/sos");
    });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable onPress={handlePress} style={styles.button}>
        <Feather name="alert-circle" size={22} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
