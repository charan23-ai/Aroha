import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { concerns } from "@/lib/concernEngine";
import { indiaStates, getDistrictsByState } from "@/lib/indiaDistricts";

type Step = "breathing" | "mood" | "details" | "location" | "concerns";

const MOOD_LABELS = ["Very Low", "Low", "Heavy", "Neutral", "Okay", "Lighter", "Good"];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { setProfile } = useApp();

  const [step, setStep] = useState<Step>("breathing");
  const [mood, setMood] = useState(3);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  const breathScale = useRef(new Animated.Value(0.6)).current;
  const breathOpacity = useRef(new Animated.Value(0.4)).current;
  const [breathText, setBreathText] = useState("Inhale");

  const colors = isDark ? Colors.dark : Colors.light;

  const filteredStates = indiaStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const districtList = getDistrictsByState(selectedState);
  const filteredDistricts = districtList.filter((d) =>
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  useEffect(() => {
    if (step !== "breathing") return;
    let active = true;

    const breathe = () => {
      if (!active) return;
      setBreathText("Inhale");
      Animated.parallel([
        Animated.timing(breathScale, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathOpacity, { toValue: 0.9, duration: 3500, useNativeDriver: true }),
      ]).start(() => {
        if (!active) return;
        setBreathText("Hold");
        setTimeout(() => {
          if (!active) return;
          setBreathText("Exhale");
          Animated.parallel([
            Animated.timing(breathScale, { toValue: 0.6, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(breathOpacity, { toValue: 0.4, duration: 3500, useNativeDriver: true }),
          ]).start(() => {
            if (active) setTimeout(breathe, 500);
          });
        }, 1000);
      });
    };

    breathe();
    const timer = setTimeout(() => {
      if (active) setStep("mood");
    }, 7000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [step]);

  const toggleConcern = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setProfile({
      name: name || "Friend",
      age,
      gender,
      state: selectedState,
      district: selectedDistrict,
      concerns: selectedConcerns,
      onboardingComplete: true,
      initialMood: mood,
    });
    router.replace("/(tabs)/home");
  };

  const bg = isDark
    ? ["#0F172A", "#0F172A"] as const
    : ["#F0F9FF", "#F5F0FF"] as const;

  if (step === "breathing") {
    return (
      <LinearGradient colors={["#0A1628", "#0F172A"]} style={styles.fill}>
        <View style={[styles.centerFull, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
          <Animated.View
            style={[styles.breathCircle, { transform: [{ scale: breathScale }], opacity: breathOpacity }]}
          >
            <LinearGradient
              colors={["#38BDF8", "#A78BFA"]}
              style={styles.breathInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          <Text style={styles.breathLabel}>{breathText}</Text>
          <View style={styles.welcomeTextWrap}>
            <Text style={styles.welcomeTitle}>Welcome to Aroha</Text>
            <Text style={styles.welcomeSub}>Take a breath with us</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (step === "mood") {
    return (
      <LinearGradient colors={bg} style={styles.fill}>
        <View style={[styles.stepContainer, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}>
          <View style={styles.stepInner}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>How are you feeling{"\n"}right now?</Text>
            <Text style={[styles.stepSub, { color: colors.textSecondary }]}>No right or wrong answer</Text>

            <View style={styles.moodTrackWrap}>
              <View style={[styles.moodTrack, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]} />
              <View style={styles.moodDotsRow}>
                {MOOD_LABELS.map((label, i) => {
                  const selected = mood === i;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => { setMood(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[
                        styles.moodDot,
                        {
                          backgroundColor: selected ? Colors.primary : (isDark ? "#334155" : "#CBD5E1"),
                          borderColor: selected ? Colors.primary : "transparent",
                          transform: [{ scale: selected ? 1.4 : 1 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.moodLabelRow}>
              {MOOD_LABELS.map((label, i) => (
                <Pressable
                  key={label}
                  onPress={() => { setMood(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={styles.moodLabelItem}
                >
                  <Text style={[
                    styles.moodLabelText,
                    {
                      color: mood === i ? Colors.primary : colors.textMuted,
                      fontFamily: mood === i ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.selectedMoodBadge, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
              <Text style={[styles.selectedMoodText, { color: Colors.primary }]}>
                {MOOD_LABELS[mood]}
              </Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={() => setStep("details")}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (step === "details") {
    return (
      <LinearGradient colors={bg} style={styles.fill}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepInner}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Tell us a little{"\n"}about yourself</Text>
              <Text style={[styles.stepSub, { color: colors.textSecondary }]}>Just for personalizing your experience</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Your name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="What should we call you?"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Age</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Your age"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Gender</Text>
              <View style={styles.chipRow}>
                {["Male", "Female", "Non-binary", "Prefer not to say"].map((g) => (
                  <Pressable
                    key={g}
                    onPress={() => { setGender(g); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.chip, { backgroundColor: gender === g ? Colors.primary : colors.surface, borderColor: gender === g ? Colors.primary : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: gender === g ? "#fff" : colors.text }]}>{g}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[styles.primaryBtn, { marginTop: 32 }]} onPress={() => setStep("location")}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  if (step === "location") {
    return (
      <LinearGradient colors={bg} style={styles.fill}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), paddingBottom: 40 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepInner}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Where are{"\n"}you based?</Text>
              <Text style={[styles.stepSub, { color: colors.textSecondary }]}>Helps us show nearby support resources</Text>

              <Text style={[styles.label, { color: colors.textSecondary }]}>State</Text>
              <Pressable
                onPress={() => { setShowStatePicker(true); setShowDistrictPicker(false); }}
                style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: selectedState ? Colors.primary : colors.border }]}
              >
                <Text style={[styles.pickerBtnText, { color: selectedState ? colors.text : colors.textMuted }]}>
                  {selectedState || "Select your state"}
                </Text>
                <Feather name={showStatePicker ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
              </Pressable>

              {showStatePicker && (
                <View style={[styles.pickerDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.pickerSearch, { color: colors.text, borderBottomColor: colors.border }]}
                    placeholder="Search state..."
                    placeholderTextColor={colors.textMuted}
                    value={stateSearch}
                    onChangeText={setStateSearch}
                    autoFocus
                  />
                  <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {filteredStates.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => {
                          setSelectedState(s);
                          setSelectedDistrict("");
                          setDistrictSearch("");
                          setShowStatePicker(false);
                          setStateSearch("");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.pickerItem, { backgroundColor: selectedState === s ? (isDark ? "#1A2744" : "#EFF6FF") : "transparent" }]}
                      >
                        <Text style={[styles.pickerItemText, { color: selectedState === s ? Colors.primary : colors.text }]}>{s}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {selectedState !== "" && (
                <>
                  <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>District</Text>
                  <Pressable
                    onPress={() => { setShowDistrictPicker(true); setShowStatePicker(false); }}
                    style={[styles.pickerBtn, { backgroundColor: colors.surface, borderColor: selectedDistrict ? Colors.primary : colors.border }]}
                  >
                    <Text style={[styles.pickerBtnText, { color: selectedDistrict ? colors.text : colors.textMuted }]}>
                      {selectedDistrict || "Select your district"}
                    </Text>
                    <Feather name={showDistrictPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
                  </Pressable>

                  {showDistrictPicker && (
                    <View style={[styles.pickerDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.pickerSearch, { color: colors.text, borderBottomColor: colors.border }]}
                        placeholder="Search district..."
                        placeholderTextColor={colors.textMuted}
                        value={districtSearch}
                        onChangeText={setDistrictSearch}
                        autoFocus
                      />
                      <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                        {filteredDistricts.map((d) => (
                          <Pressable
                            key={d}
                            onPress={() => {
                              setSelectedDistrict(d);
                              setShowDistrictPicker(false);
                              setDistrictSearch("");
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            style={[styles.pickerItem, { backgroundColor: selectedDistrict === d ? (isDark ? "#1A2744" : "#EFF6FF") : "transparent" }]}
                          >
                            <Text style={[styles.pickerItemText, { color: selectedDistrict === d ? Colors.primary : colors.text }]}>{d}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}

              <Pressable
                style={[styles.primaryBtn, { marginTop: 32 }]}
                onPress={() => setStep("concerns")}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>

              <Pressable onPress={() => setStep("concerns")} style={{ marginTop: 12, alignItems: "center" }}>
                <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip location</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={bg} style={styles.fill}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.stepContainer, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20), paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.stepInner}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>What's been on{"\n"}your mind?</Text>
          <Text style={[styles.stepSub, { color: colors.textSecondary }]}>Select all that feel true. This is private.</Text>

          <View style={styles.concernGrid}>
            {concerns.map((c) => {
              const selected = selectedConcerns.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggleConcern(c.id)}
                  style={[
                    styles.concernCard,
                    {
                      backgroundColor: selected ? (isDark ? "#1A2744" : "#EFF6FF") : colors.surface,
                      borderColor: selected ? Colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={c.icon as any}
                    size={20}
                    color={selected ? Colors.primary : colors.textMuted}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[styles.concernLabel, { color: selected ? Colors.primary : colors.text }]}>{c.label}</Text>
                  <Text style={[styles.concernPhrase, { color: colors.textMuted }]}>{c.phrase}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 28, opacity: selectedConcerns.length === 0 ? 0.5 : 1 }]}
            onPress={handleComplete}
            disabled={selectedConcerns.length === 0}
          >
            <Text style={styles.primaryBtnText}>Start my journey</Text>
          </Pressable>

          <Pressable onPress={handleComplete} style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centerFull: { flex: 1, alignItems: "center", justifyContent: "center" },
  breathCircle: {
    width: 200, height: 200, borderRadius: 100, overflow: "hidden", marginBottom: 40,
  },
  breathInner: { flex: 1 },
  breathLabel: {
    fontFamily: "Poppins_600SemiBold", fontSize: 20, color: "rgba(255,255,255,0.7)",
    letterSpacing: 4, textTransform: "uppercase", marginBottom: 60,
  },
  welcomeTextWrap: { alignItems: "center" },
  welcomeTitle: { fontFamily: "Poppins_700Bold", fontSize: 28, color: "#fff", textAlign: "center" },
  welcomeSub: { fontFamily: "Inter_400Regular", fontSize: 16, color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 8 },
  stepContainer: { flexGrow: 1, paddingHorizontal: 24 },
  stepInner: { flex: 1 },
  stepTitle: { fontFamily: "Poppins_700Bold", fontSize: 30, lineHeight: 40, marginBottom: 8 },
  stepSub: { fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 36 },
  moodTrackWrap: { marginBottom: 16, position: "relative", height: 32, justifyContent: "center" },
  moodTrack: { position: "absolute", left: 8, right: 8, height: 2, borderRadius: 1 },
  moodDotsRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 0,
  },
  moodDot: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 2,
  },
  moodLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  moodLabelItem: { flex: 1, alignItems: "center" },
  moodLabelText: { fontSize: 10, textAlign: "center" },
  selectedMoodBadge: {
    alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginBottom: 40,
  },
  selectedMoodText: { fontFamily: "Poppins_600SemiBold", fontSize: 18 },
  primaryBtn: {
    backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: "center",
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#fff" },
  label: {
    fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 8,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: "Inter_400Regular", marginBottom: 20,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5 },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  pickerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 4,
  },
  pickerBtnText: { fontFamily: "Inter_400Regular", fontSize: 16, flex: 1 },
  pickerDropdown: {
    borderWidth: 1.5, borderRadius: 14, marginBottom: 8, overflow: "hidden",
  },
  pickerSearch: {
    paddingHorizontal: 16, paddingVertical: 12, fontFamily: "Inter_400Regular", fontSize: 15,
    borderBottomWidth: 1,
  },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 13 },
  pickerItemText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  concernGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  concernCard: {
    width: "47%", borderWidth: 1.5, borderRadius: 20, padding: 16, minHeight: 110,
  },
  concernLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 13, marginBottom: 4 },
  concernPhrase: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  skipText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
