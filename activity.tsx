import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated, Easing, useColorScheme, Platform, KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getTaskById, TaskStep } from "@/lib/concernEngine";
import { useApp } from "@/context/AppContext";

function BreathingStep({ duration }: { duration: number }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const [breathText, setBreathText] = useState("Inhale");
  const [secsLeft, setSecsLeft] = useState(duration);

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
          Animated.timing(scale, { toValue: 0.6, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
            if (active) setTimeout(breathe, 500);
          });
        }, 2000);
      });
    };
    breathe();

    const interval = setInterval(() => {
      setSecsLeft((s) => Math.max(s - 1, 0));
    }, 1000);

    return () => { active = false; clearInterval(interval); };
  }, []);

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;

  return (
    <View style={{ alignItems: "center", paddingVertical: 20 }}>
      <Animated.View style={[breathStep.circle, { transform: [{ scale }] }]}>
        <LinearGradient colors={["#38BDF8", "#A78BFA"]} style={breathStep.gradient}>
          <Text style={breathStep.text}>{breathText}</Text>
        </LinearGradient>
      </Animated.View>
      <Text style={breathStep.timer}>{mins}:{secs.toString().padStart(2, "0")}</Text>
    </View>
  );
}

const breathStep = StyleSheet.create({
  circle: { width: 180, height: 180, borderRadius: 90, overflow: "hidden", marginBottom: 20 },
  gradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: "Poppins_600SemiBold", fontSize: 18, color: "#fff", letterSpacing: 3 },
  timer: { fontFamily: "Poppins_700Bold", fontSize: 32, color: Colors.primary },
});

export default function ActivityScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { addXp, saveActivity } = useApp();

  const task = getTaskById(taskId || "");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(task?.steps.length || 0).fill(""));
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (!task) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      if (currentStep < task.steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedChoice(null);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      } else {
        addXp(20);
        setCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }
    });
  };

  const handleSave = () => {
    if (task && !saved) {
      saveActivity(task.id, task.title);
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={[styles.error, { color: colors.text }]}>Activity not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontFamily: "Inter_500Medium", marginTop: 12 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (completed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? ["#1A2744", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
          style={[styles.completedHero, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60) }]}
        >
          <Animated.View style={{ alignItems: "center", opacity: fadeAnim }}>
            <LinearGradient
              colors={["#38BDF8", "#A78BFA"]}
              style={styles.completedIcon}
            >
              <Feather name="check" size={36} color="#fff" />
            </LinearGradient>
            <Text style={[styles.completedTitle, { color: colors.text }]}>You showed up{"\n"}for yourself</Text>
            <Text style={[styles.completedSub, { color: colors.textSecondary }]}>+20 XP earned · Keep going</Text>
          </Animated.View>
        </LinearGradient>

        <View style={styles.body}>
          {!saved ? (
            <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}>
              <Feather name="bookmark" size={18} color={Colors.primary} />
              <Text style={[styles.saveBtnText, { color: Colors.primary }]}>Save to MindKit</Text>
            </Pressable>
          ) : (
            <View style={[styles.savedConfirm, { backgroundColor: Colors.success + "20" }]}>
              <Feather name="check-circle" size={18} color={Colors.success} />
              <Text style={[styles.savedConfirmText, { color: Colors.success }]}>Saved to MindKit</Text>
            </View>
          )}

          <Pressable onPress={() => router.back()} style={[styles.primaryBtn, { backgroundColor: Colors.primary, marginTop: 12 }]}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/untangle")} style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={[styles.exploreMore, { color: colors.textMuted }]}>Explore more tools</Text>
          </Pressable>

          <View style={[styles.affirmCard, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF", marginTop: 24 }]}>
            <Text style={[styles.affirmText, { color: isDark ? Colors.accent : "#7C3AED" }]}>
              "One small step is enough.{"\n"}This space is yours."
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const step = task.steps[currentStep];
  const totalSteps = task.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const canContinue = () => {
    if (step.type === "breathing") return true;
    if (step.type === "text") return true;
    if (step.type === "visualization") return true;
    if (step.type === "choice") return selectedChoice !== null;
    if (step.type === "input") return answers[currentStep].trim().length > 0;
    return true;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.activityHeader, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>Step {currentStep + 1} of {totalSteps}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.progressBarWrap, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
          <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
            <Text style={[styles.stepContent, { color: colors.textSecondary }]}>{step.content}</Text>

            {step.type === "breathing" && <BreathingStep duration={step.duration || 240} />}

            {step.type === "input" && (
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Write here..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={5}
                value={answers[currentStep]}
                onChangeText={(text) => {
                  const newAnswers = [...answers];
                  newAnswers[currentStep] = text;
                  setAnswers(newAnswers);
                }}
                textAlignVertical="top"
              />
            )}

            {step.type === "choice" && step.choices && (
              <View style={{ gap: 10 }}>
                {step.choices.map((choice) => {
                  const selected = selectedChoice === choice;
                  return (
                    <Pressable
                      key={choice}
                      onPress={() => { setSelectedChoice(choice); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[styles.choiceBtn, {
                        backgroundColor: selected ? Colors.primary : colors.surface,
                        borderColor: selected ? Colors.primary : colors.border,
                      }]}
                    >
                      <Text style={[styles.choiceText, { color: selected ? "#fff" : colors.text }]}>{choice}</Text>
                      {selected && <Feather name="check" size={18} color="#fff" />}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {step.type === "visualization" && (
              <View style={[styles.visualizationBox, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
                <Feather name="eye" size={32} color={Colors.primary} style={{ marginBottom: 12 }} />
                <Text style={[styles.visualizationText, { color: colors.textSecondary }]}>
                  Close your eyes when you're ready. Take a few deep breaths and let the image form in your mind.
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 12), backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            onPress={goNext}
            style={[styles.continueBtn, { backgroundColor: canContinue() ? Colors.primary : colors.border, opacity: canContinue() ? 1 : 0.6 }]}
            disabled={!canContinue()}
          >
            <Text style={styles.continueBtnText}>
              {currentStep === totalSteps - 1 ? "Complete" : "Continue"}
            </Text>
            <Feather name={currentStep === totalSteps - 1 ? "check" : "arrow-right"} size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  activityHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1,
  },
  stepCounter: { fontFamily: "Inter_500Medium", fontSize: 14 },
  progressBarWrap: { height: 4 },
  progressFill: { height: "100%", backgroundColor: Colors.primary },
  stepTitle: { fontFamily: "Poppins_700Bold", fontSize: 24, lineHeight: 34, marginBottom: 12 },
  stepContent: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginBottom: 24 },
  textArea: {
    borderWidth: 1.5, borderRadius: 16, padding: 16, fontSize: 15,
    fontFamily: "Inter_400Regular", minHeight: 140, lineHeight: 22,
  },
  choiceBtn: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderRadius: 14, borderWidth: 1.5,
  },
  choiceText: { fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 },
  visualizationBox: { borderRadius: 20, padding: 24, alignItems: "center" },
  visualizationText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, textAlign: "center" },
  footer: { padding: 20, borderTopWidth: 1 },
  continueBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
    paddingVertical: 16, borderRadius: 16,
  },
  continueBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#fff" },
  completedHero: { alignItems: "center", paddingBottom: 40, paddingHorizontal: 20 },
  completedIcon: {
    width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  completedTitle: { fontFamily: "Poppins_700Bold", fontSize: 28, textAlign: "center", lineHeight: 36, marginBottom: 8 },
  completedSub: { fontFamily: "Inter_400Regular", fontSize: 15 },
  body: { padding: 20 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16, borderWidth: 1.5,
  },
  saveBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  savedConfirm: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16,
  },
  savedConfirmText: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  primaryBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  primaryBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#fff" },
  exploreMore: { fontFamily: "Inter_400Regular", fontSize: 15 },
  affirmCard: { borderRadius: 20, padding: 20 },
  affirmText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, fontStyle: "italic", textAlign: "center", lineHeight: 24 },
  error: { fontFamily: "Poppins_600SemiBold", fontSize: 18 },
});
