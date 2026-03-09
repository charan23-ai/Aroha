import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, useColorScheme, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import SOSButton from "@/components/SOSButton";
import {
  predictNextPeriod, getDayOfCycle, getCurrentPhase, getPhaseSupport,
  getSymptomSupport, periodSymptoms, analyzeCyclePatterns, CycleEntry,
} from "@/lib/menstrualEngine";
import { getMoodLabel } from "@/lib/emotionInsights";

type TrackerTab = "water" | "sleep" | "mood" | "bmi" | "todos" | "cycle";

const MOOD_LABELS = ["Very Low", "Low", "Heavy", "Neutral", "Okay", "Lighter", "Good"];

function WaterTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { waterToday, setWaterToday } = useApp();
  const goal = 8;

  const add = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (waterToday < 15) setWaterToday(waterToday + 1);
  };

  const remove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (waterToday > 0) setWaterToday(waterToday - 1);
  };

  const pct = Math.min((waterToday / goal) * 100, 100);

  return (
    <View>
      <LinearGradient
        colors={isDark ? ["#1A2744", "#0F172A"] : ["#EFF6FF", "#F8FAFC"]}
        style={styles.trackerHero}
      >
        <Text style={[styles.trackerBigNumber, { color: Colors.primary }]}>{waterToday}</Text>
        <Text style={[styles.trackerUnit, { color: colors.textSecondary }]}>of {goal} glasses</Text>
        <View style={[styles.progressBar, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: Colors.primary }]} />
        </View>
        <Text style={[styles.trackerInsight, { color: colors.textSecondary }]}>
          {waterToday >= goal ? "Amazing! You've hit your daily goal!" : `${goal - waterToday} more glasses to reach your goal`}
        </Text>
      </LinearGradient>

      <View style={styles.counterRow}>
        <Pressable onPress={remove} style={[styles.counterBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Feather name="minus" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.glassGrid}>
          {Array.from({ length: Math.min(waterToday, goal) }).map((_, i) => (
            <View key={i} style={[styles.glassDot, { backgroundColor: Colors.primary }]} />
          ))}
          {Array.from({ length: Math.max(goal - waterToday, 0) }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.glassDot, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]} />
          ))}
        </View>
        <Pressable onPress={add} style={[styles.counterBtn, { borderColor: Colors.primary, backgroundColor: Colors.primary }]}>
          <Feather name="plus" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function SleepTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { sleepToday, setSleepToday } = useApp();
  const goal = 8;

  const pct = Math.min((sleepToday / goal) * 100, 100);
  const quality = sleepToday >= 8 ? "Well rested" : sleepToday >= 6 ? "Fairly rested" : sleepToday >= 4 ? "Could be better" : "Sleep deprived";
  const qColor = sleepToday >= 8 ? Colors.success : sleepToday >= 6 ? Colors.warning : Colors.critical;

  return (
    <View>
      <LinearGradient
        colors={isDark ? ["#1A2744", "#0F172A"] : ["#F5F0FF", "#F8FAFC"]}
        style={styles.trackerHero}
      >
        <Text style={[styles.trackerBigNumber, { color: Colors.accent }]}>{sleepToday}</Text>
        <Text style={[styles.trackerUnit, { color: colors.textSecondary }]}>hours of sleep</Text>
        <View style={[styles.progressBar, { backgroundColor: isDark ? "#2D3748" : "#E8E0FF" }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: Colors.accent }]} />
        </View>
        <View style={[styles.qualityBadge, { backgroundColor: qColor + "20" }]}>
          <View style={[styles.qualityDot, { backgroundColor: qColor }]} />
          <Text style={[styles.qualityText, { color: qColor }]}>{quality}</Text>
        </View>
      </LinearGradient>

      <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Adjust hours slept</Text>
      <View style={styles.counterRow}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (sleepToday > 0) setSleepToday(parseFloat((sleepToday - 0.5).toFixed(1))); }}
          style={[styles.counterBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Feather name="minus" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.sleepDisplay, { color: colors.text }]}>{sleepToday}h</Text>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (sleepToday < 12) setSleepToday(parseFloat((sleepToday + 0.5).toFixed(1))); }}
          style={[styles.counterBtn, { borderColor: Colors.accent, backgroundColor: Colors.accent }]}
        >
          <Feather name="plus" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function MoodLogger() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { logMood, moodHistory } = useApp();
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = moodHistory.find((m) => m.date === today);
  const [selected, setSelected] = useState<number>(todayEntry?.score ?? 3);
  const [saved, setSaved] = useState(!!todayEntry);

  const handleSave = () => {
    logMood(selected);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const recentHistory = moodHistory.slice(-7);

  return (
    <View>
      <LinearGradient
        colors={isDark ? ["#1A2744", "#0F172A"] : ["#FFF0F6", "#F8FAFC"]}
        style={styles.trackerHero}
      >
        <Text style={[styles.moodHeroLabel, { color: colors.textSecondary }]}>How are you feeling today?</Text>
        <Text style={[styles.moodHeroCurrent, { color: Colors.accentPink }]}>{MOOD_LABELS[selected]}</Text>

        <View style={styles.moodTrackWrap}>
          <View style={[styles.moodTrack, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]} />
          <View style={styles.moodDotsRow}>
            {MOOD_LABELS.map((label, i) => (
              <Pressable
                key={label}
                onPress={() => { setSelected(i); setSaved(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.moodDot,
                  {
                    backgroundColor: selected === i ? Colors.accentPink : (isDark ? "#334155" : "#CBD5E1"),
                    transform: [{ scale: selected === i ? 1.4 : 1 }],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.moodLabelRow}>
          {MOOD_LABELS.map((label, i) => (
            <Pressable key={label} onPress={() => { setSelected(i); setSaved(false); }} style={styles.moodLabelItem}>
              <Text style={[styles.moodLabelText, {
                color: selected === i ? Colors.accentPink : colors.textMuted,
                fontFamily: selected === i ? "Inter_600SemiBold" : "Inter_400Regular",
              }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {!saved ? (
        <Pressable style={[styles.saveBtn, { backgroundColor: Colors.accentPink }]} onPress={handleSave}>
          <Feather name="check" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Log this mood</Text>
        </Pressable>
      ) : (
        <View style={[styles.savedConfirm, { backgroundColor: isDark ? "#1A2744" : "#F0FFF4" }]}>
          <Feather name="check-circle" size={16} color={Colors.success} />
          <Text style={[styles.savedConfirmText, { color: Colors.success }]}>Mood logged for today</Text>
        </View>
      )}

      {recentHistory.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionSmallTitle, { color: colors.text }]}>Past 7 days</Text>
          {recentHistory.map((entry, i) => (
            <View key={i} style={[styles.moodHistoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.moodHistoryDate, { color: colors.textMuted }]}>
                {new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </Text>
              <View style={[styles.moodHistoryBadge, { backgroundColor: Colors.accentPink + "22" }]}>
                <Text style={[styles.moodHistoryLabel, { color: Colors.accentPink }]}>{MOOD_LABELS[entry.score]}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function BMITracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      const result = w / (h * h);
      setBmi(Math.round(result * 10) / 10);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getBmiLabel = (b: number) => {
    if (b < 18.5) return { label: "Underweight", color: Colors.warning };
    if (b < 25) return { label: "Healthy weight", color: Colors.success };
    if (b < 30) return { label: "Overweight", color: Colors.warning };
    return { label: "Obese range", color: Colors.critical };
  };

  return (
    <View>
      <Text style={[styles.bmiTitle, { color: colors.text }]}>BMI Calculator</Text>
      <Text style={[styles.bmiSub, { color: colors.textSecondary }]}>For general awareness, not medical advice</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Weight (kg)"
        placeholderTextColor={colors.textMuted}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Height (cm)"
        placeholderTextColor={colors.textMuted}
        value={height}
        onChangeText={setHeight}
        keyboardType="decimal-pad"
      />

      <Pressable style={styles.calcBtn} onPress={calculate}>
        <Text style={styles.calcBtnText}>Calculate</Text>
      </Pressable>

      {bmi !== null && (
        <View style={[styles.bmiResult, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
          <Text style={[styles.bmiValue, { color: getBmiLabel(bmi).color }]}>{bmi}</Text>
          <Text style={[styles.bmiLabel, { color: getBmiLabel(bmi).color }]}>{getBmiLabel(bmi).label}</Text>
        </View>
      )}
    </View>
  );
}

function TodoTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { todos, addTodo, toggleTodo, deleteTodo } = useApp();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    addTodo(input.trim());
    setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const done = todos.filter((t) => t.done).length;

  return (
    <View>
      <Text style={[styles.todoStats, { color: colors.textSecondary }]}>{done}/{todos.length} tasks done today</Text>

      <View style={styles.todoInputRow}>
        <TextInput
          style={[styles.todoInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Add a task..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable onPress={handleAdd} style={[styles.todoAddBtn, { backgroundColor: Colors.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {todos.length === 0 && (
        <View style={[styles.emptyTodo, { borderColor: colors.border }]}>
          <Feather name="check-circle" size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyTodoText, { color: colors.textMuted }]}>No tasks yet. What's on your mind?</Text>
        </View>
      )}

      {todos.map((todo) => (
        <Pressable
          key={todo.id}
          onPress={() => { toggleTodo(todo.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.todoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.todoCheck, { borderColor: todo.done ? Colors.success : colors.border, backgroundColor: todo.done ? Colors.success : "transparent" }]}>
            {todo.done && <Feather name="check" size={12} color="#fff" />}
          </View>
          <Text style={[styles.todoText, { color: colors.text, textDecorationLine: todo.done ? "line-through" : "none", opacity: todo.done ? 0.5 : 1 }]}>
            {todo.text}
          </Text>
          <Pressable onPress={() => { deleteTodo(todo.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

function CycleTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { cycleEntries, addCycleEntry } = useApp();

  const [lastPeriodDate, setLastPeriodDate] = useState(
    cycleEntries[0]?.startDate || ""
  );
  const [cycleLength, setCycleLength] = useState(
    cycleEntries[0]?.cycleLength || 28
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    cycleEntries[0]?.symptoms || []
  );
  const [moodScore, setMoodScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null);
  const [saved, setSaved] = useState(!!cycleEntries[0]);

  const phaseColor = "#F472B6";

  const latestEntry = cycleEntries[0];
  const dayOfCycle = latestEntry ? getDayOfCycle(latestEntry.startDate) : null;
  const currentPhase = dayOfCycle ? getCurrentPhase(dayOfCycle, latestEntry?.cycleLength || 28) : "unknown";
  const phaseSupport = getPhaseSupport(currentPhase);
  const nextPeriod = latestEntry ? predictNextPeriod(latestEntry.startDate, latestEntry.cycleLength) : null;

  const patternInsight = analyzeCyclePatterns(cycleEntries);

  const toggleSymptom = (s: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    if (!lastPeriodDate) return;
    addCycleEntry({
      startDate: lastPeriodDate,
      cycleLength,
      symptoms: selectedSymptoms,
      mood: moodScore,
      notes,
    });
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View>
      {latestEntry && dayOfCycle !== null && (
        <LinearGradient
          colors={isDark ? ["#3D1A44", "#0F172A"] : ["#FFF0F6", "#F8FAFC"]}
          style={styles.cycleHero}
        >
          <View style={styles.cycleHeroTop}>
            <View>
              <Text style={[styles.cycleDay, { color: phaseColor }]}>Day {dayOfCycle}</Text>
              <Text style={[styles.cyclePhaseLabel, { color: colors.text }]}>{phaseSupport.phaseLabel}</Text>
              <Text style={[styles.cyclePhaseDesc, { color: colors.textSecondary }]}>{phaseSupport.phaseDesc}</Text>
            </View>
            <View style={[styles.energyBadge, { backgroundColor: phaseColor + "22" }]}>
              <Feather
                name={phaseSupport.energyLevel === "high" ? "zap" : phaseSupport.energyLevel === "medium" ? "sun" : "moon"}
                size={14}
                color={phaseColor}
              />
              <Text style={[styles.energyText, { color: phaseColor }]}>
                {phaseSupport.energyLevel === "high" ? "High" : phaseSupport.energyLevel === "medium" ? "Medium" : "Low"} energy
              </Text>
            </View>
          </View>

          {nextPeriod && (
            <View style={[styles.nextPeriodRow, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(244,114,182,0.1)" }]}>
              <Feather name="calendar" size={14} color={phaseColor} />
              <Text style={[styles.nextPeriodText, { color: colors.textSecondary }]}>
                Next period expected: <Text style={{ color: phaseColor, fontFamily: "Inter_600SemiBold" }}>
                  {new Date(nextPeriod).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Text>
              </Text>
            </View>
          )}
        </LinearGradient>
      )}

      {latestEntry && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionSmallTitle, { color: colors.text }]}>Phase support</Text>
          {phaseSupport.actions.map((action, i) => (
            <View key={i} style={[styles.actionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.actionDot, { backgroundColor: phaseColor }]} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action}</Text>
            </View>
          ))}
          {phaseSupport.emotionalPrompt && (
            <View style={[styles.promptCard, { backgroundColor: isDark ? "#1E1A3D" : "#FFF0F6" }]}>
              <Feather name="message-circle" size={16} color={phaseColor} style={{ marginBottom: 6 }} />
              <Text style={[styles.promptText, { color: colors.text }]}>{phaseSupport.emotionalPrompt}</Text>
            </View>
          )}
          {phaseSupport.cbtExercise && (
            <View style={[styles.cbtCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
              <Text style={[styles.cbtLabel, { color: Colors.primary }]}>CBT Prompt</Text>
              <Text style={[styles.cbtText, { color: colors.text }]}>{phaseSupport.cbtExercise}</Text>
            </View>
          )}
          {patternInsight && cycleEntries.length > 1 && (
            <View style={[styles.insightBanner, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF", borderColor: Colors.primary }]}>
              <Feather name="trending-up" size={15} color={Colors.primary} style={{ marginBottom: 4 }} />
              <Text style={[styles.insightBannerText, { color: colors.text }]}>{patternInsight}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={[styles.sectionSmallTitle, { color: colors.text }]}>Log a new cycle</Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>First day of last period</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="YYYY-MM-DD (e.g. 2026-03-01)"
        placeholderTextColor={colors.textMuted}
        value={lastPeriodDate}
        onChangeText={(v) => { setLastPeriodDate(v); setSaved(false); }}
      />

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Cycle length (days)</Text>
      <View style={styles.cycleLengthRow}>
        <Pressable
          onPress={() => { if (cycleLength > 21) setCycleLength(cycleLength - 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.counterBtnSmall, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Feather name="minus" size={16} color={colors.text} />
        </Pressable>
        <Text style={[styles.cycleLengthText, { color: colors.text }]}>{cycleLength} days</Text>
        <Pressable
          onPress={() => { if (cycleLength < 35) setCycleLength(cycleLength + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.counterBtnSmall, { borderColor: phaseColor, backgroundColor: phaseColor }]}
        >
          <Feather name="plus" size={16} color="#fff" />
        </Pressable>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Symptoms (tap to select)</Text>
      <View style={styles.symptomGrid}>
        {periodSymptoms.map((s) => {
          const sel = selectedSymptoms.includes(s);
          return (
            <Pressable
              key={s}
              onPress={() => {
                toggleSymptom(s);
                setExpandedSymptom(expandedSymptom === s ? null : s);
              }}
              style={[styles.symptomChip, {
                backgroundColor: sel ? phaseColor : colors.surface,
                borderColor: sel ? phaseColor : colors.border,
              }]}
            >
              <Text style={[styles.symptomChipText, { color: sel ? "#fff" : colors.text }]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      {expandedSymptom && selectedSymptoms.includes(expandedSymptom) && (
        <View style={[styles.symptomSupportCard, { backgroundColor: isDark ? "#1A2744" : "#FFF0F6" }]}>
          <Text style={[styles.symptomSupportTitle, { color: colors.text }]}>Support for {expandedSymptom}</Text>
          {getSymptomSupport(expandedSymptom).map((tip, i) => (
            <View key={i} style={styles.symptomTipRow}>
              <View style={[styles.actionDot, { backgroundColor: phaseColor }]} />
              <Text style={[styles.symptomTip, { color: colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Mood today</Text>
      <View style={styles.moodDotsRowSmall}>
        {MOOD_LABELS.map((label, i) => (
          <Pressable key={label} onPress={() => { setMoodScore(i); setSaved(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.moodDotSmall, {
              backgroundColor: moodScore === i ? phaseColor : (isDark ? "#334155" : "#CBD5E1"),
              transform: [{ scale: moodScore === i ? 1.3 : 1 }],
            }]}
          />
        ))}
      </View>
      <Text style={[styles.moodSelectedLabel, { color: phaseColor }]}>{MOOD_LABELS[moodScore]}</Text>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes (optional)</Text>
      <TextInput
        style={[styles.notesInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Anything else you'd like to note..."
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={(v) => { setNotes(v); setSaved(false); }}
        multiline
        numberOfLines={3}
      />

      {!saved ? (
        <Pressable
          style={[styles.saveBtn, { backgroundColor: phaseColor, opacity: lastPeriodDate ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!lastPeriodDate}
        >
          <Feather name="save" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Save cycle entry</Text>
        </Pressable>
      ) : (
        <View style={[styles.savedConfirm, { backgroundColor: isDark ? "#1A2744" : "#F0FFF4" }]}>
          <Feather name="check-circle" size={16} color={Colors.success} />
          <Text style={[styles.savedConfirmText, { color: Colors.success }]}>Cycle entry saved</Text>
        </View>
      )}

      {cycleEntries.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionSmallTitle, { color: colors.text }]}>Cycle history</Text>
          {cycleEntries.slice(0, 5).map((entry, i) => (
            <View key={entry.id} style={[styles.cycleHistoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.cycleHistoryDate, { color: colors.text }]}>
                  {new Date(entry.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
                <Text style={[styles.cycleHistoryMeta, { color: colors.textMuted }]}>
                  {entry.cycleLength}-day cycle · {entry.symptoms.slice(0, 2).join(", ") || "No symptoms logged"}
                </Text>
              </View>
              <Text style={[styles.cycleHistoryMood, { color: phaseColor }]}>{MOOD_LABELS[entry.mood]}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function TrackingScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { profile } = useApp();
  const [activeTab, setActiveTab] = useState<TrackerTab>("water");

  const isFemale = profile?.gender === "Female";

  const tabs: { id: TrackerTab; label: string; icon: string }[] = [
    { id: "water", label: "Water", icon: "droplet" },
    { id: "sleep", label: "Sleep", icon: "moon" },
    { id: "mood", label: "Mood", icon: "heart" },
    { id: "bmi", label: "BMI", icon: "activity" },
    { id: "todos", label: "To-do", icon: "check-square" },
    ...(isFemale ? [{ id: "cycle" as TrackerTab, label: "Cycle", icon: "circle" }] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#F0FFF4", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tracking</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Small habits build big change</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", gap: 10, paddingRight: 20 }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => { setActiveTab(tab.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.tabBtn, { backgroundColor: active ? Colors.primary : colors.surface, borderColor: active ? Colors.primary : colors.border }]}
                  >
                    <Feather name={tab.icon as any} size={16} color={active ? "#fff" : colors.textSecondary} />
                    <Text style={[styles.tabBtnText, { color: active ? "#fff" : colors.text }]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </LinearGradient>

        <View style={styles.body}>
          {activeTab === "water" && <WaterTracker />}
          {activeTab === "sleep" && <SleepTracker />}
          {activeTab === "mood" && <MoodLogger />}
          {activeTab === "bmi" && <BMITracker />}
          {activeTab === "todos" && <TodoTracker />}
          {activeTab === "cycle" && <CycleTracker />}
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
  tabBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5,
  },
  tabBtnText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  trackerHero: { borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 24 },
  trackerBigNumber: { fontFamily: "Poppins_700Bold", fontSize: 64 },
  trackerUnit: { fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 16 },
  progressBar: { width: "100%", height: 8, borderRadius: 4, marginBottom: 12, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  trackerInsight: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 24 },
  counterBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  glassGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  glassDot: { width: 16, height: 16, borderRadius: 8 },
  sliderLabel: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", marginBottom: 16 },
  sleepDisplay: { fontFamily: "Poppins_700Bold", fontSize: 40, width: 100, textAlign: "center" },
  qualityBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  qualityDot: { width: 8, height: 8, borderRadius: 4 },
  qualityText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  moodHeroLabel: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 8 },
  moodHeroCurrent: { fontFamily: "Poppins_700Bold", fontSize: 32, marginBottom: 24 },
  moodTrackWrap: { width: "100%", height: 32, justifyContent: "center", marginBottom: 12 },
  moodTrack: { position: "absolute", left: 8, right: 8, height: 2, borderRadius: 1 },
  moodDotsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moodDot: { width: 16, height: 16, borderRadius: 8 },
  moodLabelRow: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  moodLabelItem: { flex: 1, alignItems: "center" },
  moodLabelText: { fontSize: 10, textAlign: "center" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, marginBottom: 8,
  },
  saveBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#fff" },
  savedConfirm: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, marginBottom: 8,
  },
  savedConfirmText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sectionSmallTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 12 },
  moodHistoryItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 8,
  },
  moodHistoryDate: { fontFamily: "Inter_400Regular", fontSize: 13 },
  moodHistoryBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  moodHistoryLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bmiTitle: { fontFamily: "Poppins_700Bold", fontSize: 22, marginBottom: 4 },
  bmiSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 20 },
  input: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 12,
  },
  calcBtn: {
    backgroundColor: Colors.success, paddingVertical: 14, borderRadius: 14, alignItems: "center", marginBottom: 20,
  },
  calcBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#fff" },
  bmiResult: { borderRadius: 20, padding: 24, alignItems: "center" },
  bmiValue: { fontFamily: "Poppins_700Bold", fontSize: 48 },
  bmiLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16, marginTop: 4 },
  todoStats: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 16 },
  todoInputRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  todoInput: { flex: 1, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  todoAddBtn: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emptyTodo: { alignItems: "center", padding: 32, borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed" },
  emptyTodoText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  todoItem: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderRadius: 14, borderWidth: 1.5, marginBottom: 10,
  },
  todoCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  todoText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  cycleHero: { borderRadius: 24, padding: 20, marginBottom: 20 },
  cycleHeroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cycleDay: { fontFamily: "Poppins_700Bold", fontSize: 36 },
  cyclePhaseLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginTop: 2 },
  cyclePhaseDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, marginTop: 4, maxWidth: "80%" },
  energyBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  energyText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  nextPeriodRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
  },
  nextPeriodText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  actionItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1.5, marginBottom: 8,
  },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4, flexShrink: 0 },
  actionText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
  promptCard: { borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 12 },
  promptText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, fontStyle: "italic" },
  cbtCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  cbtLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  cbtText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  insightBanner: { borderRadius: 16, padding: 14, borderWidth: 1.5, marginBottom: 16 },
  insightBannerText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  cycleLengthRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12 },
  counterBtnSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  cycleLengthText: { fontFamily: "Poppins_600SemiBold", fontSize: 18, flex: 1, textAlign: "center" },
  symptomGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  symptomChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  symptomChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  symptomSupportCard: { borderRadius: 16, padding: 14, marginBottom: 12 },
  symptomSupportTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 10 },
  symptomTipRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  symptomTip: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 18 },
  moodDotsRowSmall: { flexDirection: "row", gap: 8, marginBottom: 8 },
  moodDotSmall: { width: 14, height: 14, borderRadius: 7 },
  moodSelectedLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 12 },
  notesInput: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 16, minHeight: 80,
    textAlignVertical: "top",
  },
  cycleHistoryItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 8,
  },
  cycleHistoryDate: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 2 },
  cycleHistoryMeta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  cycleHistoryMood: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 14 },
});
