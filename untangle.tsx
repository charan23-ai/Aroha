import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { concerns, getTopTasks } from "@/lib/concernEngine";
import SOSButton from "@/components/SOSButton";

const emotions = [
  { label: "Anxious", icon: "cloud", concern: "anxiety" },
  { label: "Numb", icon: "moon", concern: "emotional_numbness" },
  { label: "Overwhelmed", icon: "wind", concern: "academic_burnout" },
  { label: "Lonely", icon: "user", concern: "loneliness" },
  { label: "Sad", icon: "cloud-rain", concern: "low_self_esteem" },
  { label: "Confused", icon: "help-circle", concern: "relationship_issues" },
  { label: "Pressured", icon: "alert-triangle", concern: "peer_pressure" },
  { label: "Restless", icon: "activity", concern: "mood_swings" },
];

export default function UntangleScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedConcern, setSelectedConcern] = useState<string | null>(null);

  const activeConcern = selectedConcern || (selectedEmotion ? emotions.find((e) => e.label === selectedEmotion)?.concern : null);
  const tasks = activeConcern ? getTopTasks(activeConcern) : [];

  const handleEmotionSelect = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEmotion(label === selectedEmotion ? null : label);
    setSelectedConcern(null);
  };

  const handleConcernSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcern(id === selectedConcern ? null : id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#F5F0FF", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Untangle</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Let's work through what you're feeling</Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How are you feeling?</Text>
          <View style={styles.emotionGrid}>
            {emotions.map((e) => {
              const selected = selectedEmotion === e.label;
              return (
                <Pressable
                  key={e.label}
                  onPress={() => handleEmotionSelect(e.label)}
                  style={[
                    styles.emotionBtn,
                    {
                      backgroundColor: selected ? Colors.accent : colors.surface,
                      borderColor: selected ? Colors.accent : colors.border,
                    },
                  ]}
                >
                  <Feather name={e.icon as any} size={22} color={selected ? "#fff" : colors.textMuted} />
                  <Text style={[styles.emotionLabel, { color: selected ? "#fff" : colors.text }]}>{e.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>Or select a specific concern</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: "row", gap: 10, paddingRight: 20 }}>
              {concerns.map((c) => {
                const selected = selectedConcern === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => handleConcernSelect(c.id)}
                    style={[
                      styles.concernChip,
                      {
                        backgroundColor: selected ? Colors.primary : colors.surface,
                        borderColor: selected ? Colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.concernChipText, { color: selected ? "#fff" : colors.text }]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {tasks.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tools for this feeling</Text>
              {tasks.map((task, i) => (
                <Pressable
                  key={task.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: "/activity", params: { taskId: task.id } });
                  }}
                  style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.taskRank, { backgroundColor: i === 0 ? Colors.primary : (isDark ? "#2D3748" : "#E0F2FE") }]}>
                    <Text style={[styles.taskRankText, { color: i === 0 ? "#fff" : Colors.primary }]}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>{task.description}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <Feather name="clock" size={12} color={colors.textMuted} />
                      <Text style={[styles.taskDuration, { color: colors.textMuted }]}>{task.duration}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </>
          )}

          {!selectedEmotion && !selectedConcern && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="heart" size={36} color={Colors.accent} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Select how you're feeling</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>We'll suggest tools tailored to this moment</Text>
            </View>
          )}

          <Pressable
            onPress={() => router.push("/diagnostic")}
            style={[styles.diagBanner, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}
          >
            <Feather name="activity" size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.diagTitle, { color: colors.text }]}>Not sure what's going on?</Text>
              <Text style={[styles.diagSub, { color: colors.textSecondary }]}>Take a quick wellbeing check</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
      <SOSButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 32, marginBottom: 4 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 15 },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 14 },
  emotionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  emotionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, borderWidth: 1.5,
  },
  emotionLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  concernChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5,
  },
  concernChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  taskCard: {
    flexDirection: "row", alignItems: "center", gap: 14, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginBottom: 12,
  },
  taskRank: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  taskRankText: { fontFamily: "Poppins_700Bold", fontSize: 14 },
  taskTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  taskDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  taskDuration: { fontFamily: "Inter_400Regular", fontSize: 12 },
  emptyState: {
    alignItems: "center", padding: 40, borderRadius: 24, borderWidth: 1.5,
    borderStyle: "dashed", marginVertical: 16,
  },
  emptyTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 6 },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  diagBanner: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginTop: 8,
  },
  diagTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  diagSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
