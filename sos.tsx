import React, { useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing, Linking, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const helplines = [
  { name: "iCall (TISS)", number: "9152987821", desc: "Mon-Sat, 8am-10pm" },
  { name: "Vandrevala Foundation", number: "18602662345", desc: "24/7 · Free helpline" },
  { name: "AASRA", number: "9820466627", desc: "24/7 crisis support" },
  { name: "Snehi", number: "044-24640050", desc: "Mental health support" },
];

function BreathingGuide() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const scale = useRef(new Animated.Value(0.7)).current;
  const [breathText, setBreathText] = React.useState("Inhale");

  useEffect(() => {
    let active = true;
    const breathe = () => {
      if (!active) return;
      setBreathText("Inhale");
      Animated.timing(scale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
        if (!active) return;
        setBreathText("Hold");
        setTimeout(() => {
          if (!active) return;
          setBreathText("Exhale");
          Animated.timing(scale, { toValue: 0.7, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
            if (active) setTimeout(breathe, 500);
          });
        }, 2000);
      });
    };
    breathe();
    return () => { active = false; };
  }, []);

  return (
    <View style={breathStyles.container}>
      <Animated.View style={[breathStyles.circle, { transform: [{ scale }] }]}>
        <LinearGradient colors={["#38BDF8", "#A78BFA"]} style={breathStyles.gradient}>
          <Text style={breathStyles.text}>{breathText}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const breathStyles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 20 },
  circle: { width: 140, height: 140, borderRadius: 70, overflow: "hidden" },
  gradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#fff", letterSpacing: 2 },
});

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const call = (number: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <LinearGradient
          colors={isDark ? ["#2D0A0A", "#0F172A"] : ["#FFF0F0", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Pressable onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Feather name="chevron-left" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>You don't have to{"\n"}handle this alone</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Immediate support is available</Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.emergencyRow}>
            <Pressable
              onPress={() => call("112")}
              style={[styles.emergencyBtn, { backgroundColor: "#EF4444" }]}
            >
              <Feather name="phone-call" size={22} color="#fff" />
              <Text style={styles.emergencyBtnText}>Ambulance{"\n"}112</Text>
            </Pressable>
            <Pressable
              onPress={() => call("9152987821")}
              style={[styles.emergencyBtn, { backgroundColor: "#F97316" }]}
            >
              <Feather name="headphones" size={22} color="#fff" />
              <Text style={styles.emergencyBtnText}>Helpline{"\n"}iCall</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/professional-help")}
              style={[styles.emergencyBtn, { backgroundColor: Colors.primary }]}
            >
              <Feather name="map-pin" size={22} color="#fff" />
              <Text style={styles.emergencyBtnText}>Find{"\n"}Hospital</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Calm down with me</Text>
          <View style={[styles.breathCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
            <BreathingGuide />
            <Text style={[styles.breathSub, { color: colors.textSecondary }]}>
              Follow the circle. Breathe in as it grows, out as it shrinks.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>5-4-3-2-1 Grounding</Text>
          <View style={[styles.groundingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { n: "5", sense: "things you can SEE", color: Colors.primary },
              { n: "4", sense: "things you can TOUCH", color: Colors.accent },
              { n: "3", sense: "things you can HEAR", color: Colors.success },
              { n: "2", sense: "things you can SMELL", color: Colors.warning },
              { n: "1", sense: "thing you can TASTE", color: Colors.accentPink },
            ].map((item) => (
              <View key={item.n} style={styles.groundingRow}>
                <View style={[styles.groundingNum, { backgroundColor: item.color + "20" }]}>
                  <Text style={[styles.groundingNumText, { color: item.color }]}>{item.n}</Text>
                </View>
                <Text style={[styles.groundingText, { color: colors.text }]}>{item.sense}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Helplines</Text>
          {helplines.map((h) => (
            <Pressable
              key={h.name}
              onPress={() => call(h.number)}
              style={[styles.helplineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View>
                <Text style={[styles.helplineName, { color: colors.text }]}>{h.name}</Text>
                <Text style={[styles.helplineDesc, { color: colors.textMuted }]}>{h.desc}</Text>
              </View>
              <View style={styles.callChip}>
                <Feather name="phone" size={14} color={Colors.primary} />
                <Text style={[styles.callChipText, { color: Colors.primary }]}>{h.number}</Text>
              </View>
            </Pressable>
          ))}

          <View style={[styles.affirmCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
            <Text style={[styles.affirmText, { color: colors.text }]}>
              Your feelings are real and valid. Reaching out for help is one of the bravest things you can do.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 28, lineHeight: 38, marginBottom: 6 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 15 },
  body: { padding: 20 },
  emergencyRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  emergencyBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 18, borderRadius: 20,
  },
  emergencyBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#fff", textAlign: "center" },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 12 },
  breathCard: { borderRadius: 24, padding: 16, marginBottom: 20, alignItems: "center" },
  breathSub: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", marginTop: 8 },
  groundingCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  groundingRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  groundingNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  groundingNumText: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  groundingText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  helplineCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10,
  },
  helplineName: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 2 },
  helplineDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },
  callChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  callChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  affirmCard: { borderRadius: 20, padding: 20, marginTop: 4 },
  affirmText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, textAlign: "center" },
});
