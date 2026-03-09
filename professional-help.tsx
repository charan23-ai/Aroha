import React from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Linking, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import SOSButton from "@/components/SOSButton";

const hospitals = [
  { name: "NIMHANS", location: "Bengaluru, Karnataka", type: "Govt. Mental Health Institute", number: "08046110007" },
  { name: "IHBAS", location: "Delhi", type: "Govt. Institute of Mental Health", number: "01122548300" },
  { name: "LGB Regional Institute", location: "Tezpur, Assam", type: "Regional Mental Health Centre", number: "03712234183" },
  { name: "Lokopriya Gopinath", location: "Guwahati, Assam", type: "Psychiatric Unit", number: "03612529457" },
];

const youthHelplines = [
  { name: "iCall (TISS)", number: "9152987821", desc: "Counseling by trained psychologists", hours: "Mon-Sat, 8am-10pm" },
  { name: "Vandrevala Foundation", number: "18602662345", desc: "Free 24/7 mental health support", hours: "24/7 · Free" },
  { name: "AASRA", number: "9820466627", desc: "Crisis intervention & suicide prevention", hours: "24/7" },
  { name: "Snehi", number: "044-24640050", desc: "Emotional support & counseling", hours: "Mon-Sat, 8am-10pm" },
  { name: "iHeal", number: "9811099099", desc: "Youth mental health support", hours: "Mon-Sat, 9am-7pm" },
];

export default function ProfessionalHelpScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { profile } = useApp();

  const call = (number: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Feather name="chevron-left" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Professional{"\n"}Support</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Verified resources near {profile?.district || "you"}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.emergencyBanner, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <Feather name="alert-circle" size={18} color={Colors.critical} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.emergencyBannerTitle, { color: "#991B1B" }]}>In immediate danger?</Text>
              <Text style={[styles.emergencyBannerSub, { color: "#B91C1C" }]}>Call 112 for emergency services</Text>
            </View>
            <Pressable onPress={() => call("112")} style={[styles.callBtn, { backgroundColor: Colors.critical }]}>
              <Feather name="phone-call" size={14} color="#fff" />
              <Text style={styles.callBtnText}>112</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Youth Helplines</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Trained counselors, anonymous and free</Text>

          {youthHelplines.map((h) => (
            <View key={h.name} style={[styles.helplineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helplineName, { color: colors.text }]}>{h.name}</Text>
                <Text style={[styles.helplineDesc, { color: colors.textSecondary }]}>{h.desc}</Text>
                <View style={[styles.hoursBadge, { backgroundColor: isDark ? "#2D3748" : "#F1F5F9" }]}>
                  <Feather name="clock" size={11} color={colors.textMuted} />
                  <Text style={[styles.hoursText, { color: colors.textMuted }]}>{h.hours}</Text>
                </View>
              </View>
              <Pressable onPress={() => call(h.number)} style={[styles.callBtn, { backgroundColor: Colors.primary }]}>
                <Feather name="phone" size={14} color="#fff" />
                <Text style={styles.callBtnText}>Call</Text>
              </Pressable>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Government Hospitals</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Verified mental health institutions</Text>

          {hospitals.map((h) => (
            <View key={h.name} style={[styles.hospitalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.hospitalIcon, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
                <Feather name="shield" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hospitalName, { color: colors.text }]}>{h.name}</Text>
                <Text style={[styles.hospitalLocation, { color: colors.textSecondary }]}>{h.location}</Text>
                <Text style={[styles.hospitalType, { color: colors.textMuted }]}>{h.type}</Text>
              </View>
              <Pressable onPress={() => call(h.number)}>
                <View style={[styles.callIconBtn, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}>
                  <Feather name="phone" size={16} color={Colors.primary} />
                </View>
              </Pressable>
            </View>
          ))}

          <View style={[styles.tipCard, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF" }]}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>How to start the conversation</Text>
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
              You don't need to have everything figured out. You can simply say:{"\n\n"}
              "I've been feeling overwhelmed lately and I think I need some support."
            </Text>
          </View>

          <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.textMuted} />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Seeking help is a sign of strength, not weakness. Millions of people use professional support every year.
            </Text>
          </View>
        </View>
      </ScrollView>
      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 30, lineHeight: 38, marginBottom: 6 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 15 },
  body: { padding: 20 },
  emergencyBanner: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 14,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 24,
  },
  emergencyBannerTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  emergencyBannerSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 17, marginBottom: 4 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 14 },
  helplineCard: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginBottom: 12,
  },
  helplineName: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 4 },
  helplineDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 8 },
  hoursBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  hoursText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  callBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
  },
  callBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#fff" },
  hospitalCard: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 14,
    borderRadius: 18, borderWidth: 1.5, marginBottom: 10,
  },
  hospitalIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  hospitalName: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 2 },
  hospitalLocation: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 2 },
  hospitalType: { fontFamily: "Inter_400Regular", fontSize: 12 },
  callIconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  tipCard: { borderRadius: 20, padding: 20, marginBottom: 12 },
  tipTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 10 },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  noteCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14,
    borderRadius: 14, borderWidth: 1.5,
  },
  noteText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
});
