import React, { useRef, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Animated, useColorScheme, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { getTopTasks, Task } from "@/lib/concernEngine";
import SOSButton from "@/components/SOSButton";
import {
  analyzeEmotionalState, getMoodLabel, getInsightIcon, getInsightColor, Insight,
} from "@/lib/emotionInsights";

function ActivityCard({ task, highlight }: { task: Task; highlight?: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      router.push({ pathname: "/activity", params: { taskId: task.id } });
    });
  };

  if (highlight) {
    return (
      <Animated.View style={{ transform: [{ scale }], marginBottom: 16 }}>
        <Pressable onPress={handlePress}>
          <LinearGradient
            colors={isDark ? ["#1A2744", "#1E1A3D"] : ["#EFF6FF", "#F5F0FF"]}
            style={styles.highlightCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.highlightBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.highlightBadgeText}>Recommended for you</Text>
            </View>
            <Text style={[styles.highlightTitle, { color: colors.text }]}>{task.title}</Text>
            <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>{task.description}</Text>
            <View style={styles.highlightFooter}>
              <View style={[styles.durationBadge, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
                <Feather name="clock" size={12} color={Colors.primary} />
                <Text style={[styles.durationText, { color: Colors.primary }]}>{task.duration}</Text>
              </View>
              <View style={styles.startBtn}>
                <Text style={styles.startBtnText}>Start</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable
        onPress={handlePress}
        style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.activityTitle, { color: colors.text }]}>{task.title}</Text>
          <Text style={[styles.activityDesc, { color: colors.textSecondary }]}>{task.description}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <Text style={[styles.activityDuration, { color: colors.textMuted }]}>{task.duration}</Text>
          <View style={[styles.startSmall, { backgroundColor: isDark ? "#1E3A5F" : "#E0F2FE" }]}>
            <Feather name="play" size={12} color={Colors.primary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function InsightCard({ insight, isDark, colors }: { insight: Insight; isDark: boolean; colors: any }) {
  const accentColor = getInsightColor(insight.type);
  const iconName = getInsightIcon(insight.type);

  return (
    <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.insightIconWrap, { backgroundColor: accentColor + "22" }]}>
        <Feather name={iconName as any} size={16} color={accentColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
        <Text style={[styles.insightBody, { color: colors.textSecondary }]}>{insight.body}</Text>
        {insight.action && (
          <Pressable
            onPress={() => insight.actionRoute && router.push(insight.actionRoute as any)}
            style={[styles.insightActionBtn, { borderColor: accentColor }]}
          >
            <Text style={[styles.insightActionText, { color: accentColor }]}>{insight.action}</Text>
            <Feather name="arrow-right" size={12} color={accentColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const {
    profile, xp, streak, moodHistory, sleepHistory, waterHistory,
    savedActivities, journalEntries, diagnosticResults,
  } = useApp();

  const primaryConcern = profile?.concerns?.[0] || "anxiety";
  const tasks = getTopTasks(primaryConcern);
  const [topTask, ...otherTasks] = tasks;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const xpLevel = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  const todayMood = moodHistory[moodHistory.length - 1];

  const insights = useMemo(() => {
    return analyzeEmotionalState({
      moodHistory: moodHistory.slice(-7).map((m) => m.score),
      sleepHistory: sleepHistory,
      waterHistory: waterHistory,
      activitiesCompleted: savedActivities.length,
      streakDays: streak,
      journalCount: journalEntries.length,
      diagnosticScore: diagnosticResults[0]?.totalScore,
    });
  }, [moodHistory, sleepHistory, waterHistory, savedActivities, streak, journalEntries, diagnosticResults]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || "Friend"}</Text>
            </View>
            <Pressable
              onPress={() => router.push("/diagnostic")}
              style={[styles.diagnosticBtn, { backgroundColor: isDark ? "#1E293B" : "#fff", borderColor: colors.border }]}
            >
              <Feather name="activity" size={18} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? "#1A2744" : "#fff" }]}>
              <Feather name="zap" size={18} color={Colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>day streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? "#1A2744" : "#fff" }]}>
              <Feather name="star" size={18} color={Colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>{xp}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>total XP</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? "#1A2744" : "#fff", flex: 1.5 }]}>
              <Feather name="trending-up" size={18} color={Colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statLabel, { color: colors.textMuted, marginBottom: 4 }]}>Level {xpLevel}</Text>
                <View style={[styles.xpBar, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
                  <View style={[styles.xpFill, { width: `${xpInLevel}%` }]} />
                </View>
              </View>
            </View>
          </View>

          {todayMood && (
            <View style={[styles.moodChip, { backgroundColor: isDark ? "#1E293B" : "#fff" }]}>
              <Feather name="heart" size={13} color={Colors.accentPink} />
              <Text style={[styles.moodChipText, { color: colors.textSecondary }]}>
                Today you said: <Text style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}>{getMoodLabel(todayMood.score)}</Text>
              </Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {insights.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your emotional insights</Text>
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} isDark={isDark} colors={colors} />
              ))}
            </>
          )}

          {topTask && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Recommended for you today</Text>
              <ActivityCard task={topTask} highlight />
            </>
          )}

          {otherTasks.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>More tools for this feeling</Text>
              {otherTasks.slice(0, 3).map((t) => (
                <ActivityCard key={t.id} task={t} />
              ))}
            </>
          )}

          <Pressable
            onPress={() => router.push("/professional-help")}
            style={[styles.helpBanner, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}
          >
            <Feather name="shield" size={20} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.helpBannerTitle, { color: colors.text }]}>Professional support</Text>
              <Text style={[styles.helpBannerSub, { color: colors.textSecondary }]}>View nearby resources and helplines</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.quoteCard, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF" }]}>
            <Text style={[styles.quoteText, { color: isDark ? Colors.accent : "#7C3AED" }]}>
              "One small step is enough."
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>This space is yours</Text>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 14 },
  userName: { fontFamily: "Poppins_700Bold", fontSize: 26, marginTop: 2 },
  diagnosticBtn: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontFamily: "Poppins_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  xpBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: Colors.success, borderRadius: 3 },
  moodChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginTop: 4,
  },
  moodChipText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 14 },
  insightCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginBottom: 12,
  },
  insightIconWrap: {
    width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center",
    marginTop: 2,
  },
  insightTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 4 },
  insightBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  insightActionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5,
  },
  insightActionText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  highlightCard: { borderRadius: 24, padding: 20 },
  highlightBadge: {
    alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  highlightBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#fff" },
  highlightTitle: { fontFamily: "Poppins_700Bold", fontSize: 22, marginBottom: 6 },
  highlightDesc: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  highlightFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  durationBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  durationText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
  },
  startBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#fff" },
  activityCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 18, borderWidth: 1.5,
  },
  activityTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 4 },
  activityDesc: { fontFamily: "Inter_400Regular", fontSize: 13 },
  activityDuration: { fontFamily: "Inter_400Regular", fontSize: 12 },
  startSmall: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  helpBanner: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginTop: 8, marginBottom: 16,
  },
  helpBannerTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  helpBannerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  quoteCard: { borderRadius: 20, padding: 20, marginTop: 4 },
  quoteText: { fontFamily: "Poppins_600SemiBold", fontSize: 16, fontStyle: "italic", marginBottom: 8 },
  quoteAuthor: { fontFamily: "Inter_400Regular", fontSize: 12 },
});
