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
import { hamaQuestions, hamaLabels, calculateHAMA, quickEvalQuestions } from "@/lib/hamiltonScale";
import { useApp } from "@/context/AppContext";

type Mode = "choice" | "quick" | "full" | "result";

export default function DiagnosticScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { addDiagnosticResult, addXp } = useApp();

  const [mode, setMode] = useState<Mode>("choice");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>(Array(14).fill(-1));
  const [quickScores, setQuickScores] = useState<number[]>(Array(4).fill(-1));
  const [result, setResult] = useState<ReturnType<typeof calculateHAMA> | null>(null);

  const handleFullAnswer = (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScores = [...scores];
    newScores[currentQ] = score;
    setScores(newScores);

    if (currentQ < hamaQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const res = calculateHAMA(newScores);
      addDiagnosticResult({ scores: newScores, date: new Date().toISOString(), totalScore: res.totalScore, severity: res.severity });
      addXp(30);
      setResult(res);
      setMode("result");
    }
  };

  const handleQuickAnswer = (score: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScores = [...quickScores];
    newScores[currentQ] = score;
    setQuickScores(newScores);

    if (currentQ < quickEvalQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const fullScores = Array(14).fill(0);
      quickEvalQuestions.forEach((q, i) => {
        q.hamIndices.forEach((idx) => { fullScores[idx] = Math.max(fullScores[idx], newScores[i]); });
      });
      const res = calculateHAMA(fullScores);
      addDiagnosticResult({ scores: fullScores, date: new Date().toISOString(), totalScore: res.totalScore, severity: res.severity });
      addXp(15);
      setResult(res);
      setMode("result");
    }
  };

  const getSeverityColor = (s: string) => {
    if (s === "Mild") return Colors.success;
    if (s === "Mild-Moderate") return Colors.warning;
    if (s === "Moderate-Severe") return "#F97316";
    return Colors.critical;
  };

  if (mode === "choice") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Feather name="chevron-left" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wellbeing Check</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Understand what your mind and body are telling you</Text>
        </LinearGradient>

        <View style={styles.body}>
          <Pressable
            onPress={() => { setMode("quick"); setCurrentQ(0); }}
            style={[styles.optionCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary + "20" }]}>
              <Feather name="zap" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Quick check</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>4 questions · 2 minutes</Text>
              <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Get a fast snapshot of how you're doing</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => { setMode("full"); setCurrentQ(0); }}
            style={[styles.optionCard, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF", borderColor: Colors.accent }]}
          >
            <View style={[styles.optionIcon, { backgroundColor: Colors.accent + "20" }]}>
              <Feather name="clipboard" size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Full evaluation</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>14 questions · 8 minutes</Text>
              <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Based on the Hamilton Anxiety Rating Scale — a research-backed tool</Text>
            </View>
          </Pressable>

          <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Feather name="shield" size={16} color={colors.textMuted} />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              This is not a clinical diagnosis. It's a self-reflection tool to help you understand your emotional state.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (mode === "quick" || mode === "full") {
    const questions = mode === "quick" ? quickEvalQuestions : hamaQuestions;
    const currentScores = mode === "quick" ? quickScores : scores;
    const totalQ = questions.length;
    const progress = ((currentQ + 1) / totalQ) * 100;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.questionHeader, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), borderBottomColor: colors.border }]}>
          <Pressable onPress={() => { setMode("choice"); setCurrentQ(0); }}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>{currentQ + 1} of {totalQ}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.progressBarWrap, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView contentContainerStyle={{ flex: 1, padding: 24 }} scrollEnabled={false}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {questions[currentQ].text}
            </Text>
            {"description" in questions[currentQ] && (
              <Text style={[styles.questionDesc, { color: colors.textSecondary }]}>
                {(questions[currentQ] as any).description}
              </Text>
            )}

            <View style={styles.answersGrid}>
              {hamaLabels.slice(0, mode === "quick" ? 4 : 5).map((label, i) => {
                const selected = currentScores[currentQ] === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => mode === "quick" ? handleQuickAnswer(i) : handleFullAnswer(i)}
                    style={[
                      styles.answerBtn,
                      {
                        backgroundColor: selected ? Colors.primary : colors.surface,
                        borderColor: selected ? Colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.answerScore, { color: selected ? "#fff" : colors.textMuted }]}>{i}</Text>
                    <Text style={[styles.answerLabel, { color: selected ? "#fff" : colors.text }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (mode === "result" && result) {
    const sColor = getSeverityColor(result.severity);
    const psychicPct = Math.round((result.psychicScore / 28) * 100);
    const somaticPct = Math.round((result.somaticScore / 28) * 100);

    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 60 }}>
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your results</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Remember — you are not your score</Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.resultHero, { backgroundColor: sColor + "15", borderColor: sColor + "40" }]}>
            <Text style={[styles.resultScore, { color: sColor }]}>{result.totalScore}</Text>
            <Text style={[styles.resultOutOf, { color: colors.textSecondary }]}>out of 56</Text>
            <View style={[styles.severityBadge, { backgroundColor: sColor }]}>
              <Text style={styles.severityBadgeText}>{result.severity}</Text>
            </View>
          </View>

          <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>What this means</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>{result.insight}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mind vs Body</Text>
          <View style={[styles.splitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.splitRow}>
              <Text style={[styles.splitLabel, { color: colors.text }]}>Emotional / Mental</Text>
              <Text style={[styles.splitPct, { color: Colors.accent }]}>{psychicPct}%</Text>
            </View>
            <View style={[styles.splitBar, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
              <View style={[styles.splitFill, { width: `${psychicPct}%`, backgroundColor: Colors.accent }]} />
            </View>

            <View style={[styles.splitRow, { marginTop: 16 }]}>
              <Text style={[styles.splitLabel, { color: colors.text }]}>Physical / Somatic</Text>
              <Text style={[styles.splitPct, { color: Colors.primary }]}>{somaticPct}%</Text>
            </View>
            <View style={[styles.splitBar, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
              <View style={[styles.splitFill, { width: `${somaticPct}%`, backgroundColor: Colors.primary }]} />
            </View>
          </View>

          <View style={[styles.recommendCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
            <Feather name="compass" size={20} color={Colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.recommendTitle, { color: colors.text }]}>Suggested next step</Text>
            <Text style={[styles.recommendText, { color: colors.textSecondary }]}>{result.recommendation}</Text>
          </View>

          <Pressable onPress={() => router.push("/(tabs)/untangle")} style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}>
            <Text style={styles.primaryBtnText}>Explore tools for this</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={[styles.backText, { color: colors.textMuted }]}>Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 28, marginBottom: 4 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 14 },
  body: { padding: 20 },
  optionCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 16, padding: 20,
    borderRadius: 20, borderWidth: 1.5, marginBottom: 14,
  },
  optionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  optionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 2 },
  optionSub: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 6 },
  optionDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  noteCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14,
    borderRadius: 14, borderWidth: 1.5, marginTop: 8,
  },
  noteText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  questionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  questionCounter: { fontFamily: "Inter_500Medium", fontSize: 14 },
  progressBarWrap: { height: 4 },
  progressFill: { height: "100%", backgroundColor: Colors.primary },
  questionText: { fontFamily: "Poppins_600SemiBold", fontSize: 22, lineHeight: 32, marginBottom: 10, marginTop: 16 },
  questionDesc: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginBottom: 32 },
  answersGrid: { gap: 12 },
  answerBtn: {
    flexDirection: "row", alignItems: "center", gap: 16, padding: 16,
    borderRadius: 16, borderWidth: 1.5,
  },
  answerScore: { fontFamily: "Poppins_700Bold", fontSize: 18, width: 24, textAlign: "center" },
  answerLabel: { fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 },
  resultHero: { alignItems: "center", padding: 32, borderRadius: 24, borderWidth: 1.5, marginBottom: 16 },
  resultScore: { fontFamily: "Poppins_700Bold", fontSize: 64 },
  resultOutOf: { fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 12 },
  severityBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  severityBadgeText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#fff" },
  insightCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  insightTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 8 },
  insightText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 12 },
  splitCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 16 },
  splitRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  splitLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  splitPct: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  splitBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  splitFill: { height: "100%", borderRadius: 4 },
  recommendCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  recommendTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 8 },
  recommendText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  primaryBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#fff" },
  backText: { fontFamily: "Inter_400Regular", fontSize: 15 },
});
