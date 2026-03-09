import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, useColorScheme, Platform, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { getTaskById } from "@/lib/concernEngine";
import { router } from "expo-router";
import SOSButton from "@/components/SOSButton";
import { contentLibrary, contentCategories, ContentItem } from "@/lib/contentLibrary";

type MindkitTab = "saved" | "journal" | "library" | "growth";

function ContentCard({ item, colors, isDark }: { item: ContentItem; colors: any; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const typeColor =
    item.type === "exercise" ? Colors.success :
    item.type === "article" ? Colors.primary :
    item.type === "lesson" ? Colors.accent :
    Colors.warning;

  const typeIcon =
    item.type === "exercise" ? "activity" :
    item.type === "article" ? "file-text" :
    item.type === "lesson" ? "book-open" :
    "map";

  return (
    <Pressable
      onPress={() => { setExpanded(!expanded); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.contentCardHeader}>
        <View style={[styles.contentTypeIcon, { backgroundColor: typeColor + "22" }]}>
          <Feather name={typeIcon as any} size={14} color={typeColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.contentTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={styles.contentMeta}>
            <Text style={[styles.contentType, { color: typeColor }]}>{item.type}</Text>
            <Text style={[styles.contentDot, { color: colors.textMuted }]}> · </Text>
            <Text style={[styles.contentDuration, { color: colors.textMuted }]}>{item.duration}</Text>
          </View>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
      </View>

      {expanded && (
        <View style={styles.contentExpanded}>
          <Text style={[styles.contentDesc, { color: colors.textSecondary }]}>{item.description}</Text>
          <View style={{ marginTop: 12 }}>
            {item.keyPoints.map((point, i) => (
              <View key={i} style={styles.keyPointRow}>
                <View style={[styles.keyPointDot, { backgroundColor: typeColor }]} />
                <Text style={[styles.keyPointText, { color: colors.text }]}>{point}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.contentSource, { color: colors.textMuted }]}>Source: {item.source}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function MindkitScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const { savedActivities, removeSavedActivity, journalEntries, addJournalEntry, deleteJournalEntry, xp, streak, diagnosticResults } = useApp();

  const [activeTab, setActiveTab] = useState<MindkitTab>("saved");
  const [journalText, setJournalText] = useState("");
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [activeContentCat, setActiveContentCat] = useState<string>("all");

  const tabs: { id: MindkitTab; label: string; icon: string }[] = [
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "journal", label: "Journal", icon: "lock" },
    { id: "library", label: "Library", icon: "book-open" },
    { id: "growth", label: "Growth", icon: "trending-up" },
  ];

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    addJournalEntry(journalText.trim());
    setJournalText("");
    setShowJournalModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const xpLevel = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  const filteredContent = activeContentCat === "all"
    ? contentLibrary
    : contentLibrary.filter((c) => c.category === activeContentCat);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <LinearGradient
          colors={isDark ? ["#0A1628", "#0F172A"] : ["#FFF0F6", "#F8FAFC"]}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20) }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>MindKit</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Tools that help you come back to yourself</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <View style={{ flexDirection: "row", gap: 10, paddingRight: 20 }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => { setActiveTab(tab.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.tabBtn, { backgroundColor: active ? Colors.accentPink : colors.surface, borderColor: active ? Colors.accentPink : colors.border }]}
                  >
                    <Feather name={tab.icon as any} size={15} color={active ? "#fff" : colors.textSecondary} />
                    <Text style={[styles.tabBtnText, { color: active ? "#fff" : colors.text }]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </LinearGradient>

        <View style={styles.body}>
          {activeTab === "saved" && (
            <>
              {savedActivities.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: colors.border }]}>
                  <Feather name="bookmark" size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved activities yet</Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Complete an activity and save it here for quick access</Text>
                  <Pressable onPress={() => router.push("/(tabs)/untangle")} style={[styles.emptyBtn, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.emptyBtnText}>Explore activities</Text>
                  </Pressable>
                </View>
              ) : (
                savedActivities.map((item) => {
                  const task = getTaskById(item.taskId);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({ pathname: "/activity", params: { taskId: item.taskId } });
                      }}
                      style={[styles.savedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.savedTitle, { color: colors.text }]}>{item.taskTitle}</Text>
                        {task && <Text style={[styles.savedDesc, { color: colors.textSecondary }]}>{task.description}</Text>}
                        <Text style={[styles.savedDate, { color: colors.textMuted }]}>
                          {new Date(item.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <Pressable onPress={(e) => { e.stopPropagation(); removeSavedActivity(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                          <Feather name="trash-2" size={16} color={colors.textMuted} />
                        </Pressable>
                        <Feather name="chevron-right" size={18} color={colors.textMuted} />
                      </View>
                    </Pressable>
                  );
                })
              )}
            </>
          )}

          {activeTab === "journal" && (
            <>
              <Pressable
                onPress={() => setShowJournalModal(true)}
                style={[styles.newJournalBtn, { backgroundColor: Colors.accentPink }]}
              >
                <Feather name="edit-3" size={18} color="#fff" />
                <Text style={styles.newJournalBtnText}>New entry</Text>
              </Pressable>

              {journalEntries.length === 0 ? (
                <View style={[styles.emptyState, { borderColor: colors.border }]}>
                  <Feather name="lock" size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>Your journal is empty</Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>This is a private space. Only you can see what's here.</Text>
                </View>
              ) : (
                journalEntries.map((entry) => (
                  <View key={entry.id} style={[styles.journalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.journalHeader}>
                      <Text style={[styles.journalDate, { color: colors.textMuted }]}>
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                      <Pressable onPress={() => { deleteJournalEntry(entry.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                        <Feather name="trash-2" size={14} color={colors.textMuted} />
                      </Pressable>
                    </View>
                    <Text style={[styles.journalText, { color: colors.text }]} numberOfLines={4}>{entry.content}</Text>
                  </View>
                ))
              )}
            </>
          )}

          {activeTab === "library" && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Mental wellness library</Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Research-backed knowledge, written simply</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
                  <Pressable
                    onPress={() => { setActiveContentCat("all"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.catChip, {
                      backgroundColor: activeContentCat === "all" ? Colors.accentPink : colors.surface,
                      borderColor: activeContentCat === "all" ? Colors.accentPink : colors.border,
                    }]}
                  >
                    <Text style={[styles.catChipText, { color: activeContentCat === "all" ? "#fff" : colors.text }]}>All</Text>
                  </Pressable>
                  {contentCategories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => { setActiveContentCat(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      style={[styles.catChip, {
                        backgroundColor: activeContentCat === cat.id ? Colors.accentPink : colors.surface,
                        borderColor: activeContentCat === cat.id ? Colors.accentPink : colors.border,
                      }]}
                    >
                      <Feather name={cat.icon as any} size={13} color={activeContentCat === cat.id ? "#fff" : colors.textSecondary} />
                      <Text style={[styles.catChipText, { color: activeContentCat === cat.id ? "#fff" : colors.text }]}>{cat.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {filteredContent.map((item) => (
                <ContentCard key={item.id} item={item} colors={colors} isDark={isDark} />
              ))}

              <View style={[styles.libraryFooter, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF" }]}>
                <Feather name="info" size={14} color={isDark ? Colors.accent : "#7C3AED"} style={{ marginBottom: 8 }} />
                <Text style={[styles.libraryFooterText, { color: isDark ? Colors.accent : "#7C3AED" }]}>
                  Knowledge is a form of self-care. The more you understand what you're experiencing, the less alone it feels.
                </Text>
              </View>
            </>
          )}

          {activeTab === "growth" && (
            <>
              <View style={[styles.growthCard, { backgroundColor: isDark ? "#1A2744" : "#EFF6FF" }]}>
                <Text style={[styles.growthTitle, { color: colors.text }]}>Your growth snapshot</Text>
                <View style={styles.growthStats}>
                  <View style={styles.growthStat}>
                    <Text style={[styles.growthStatValue, { color: Colors.primary }]}>{xp}</Text>
                    <Text style={[styles.growthStatLabel, { color: colors.textSecondary }]}>Total XP</Text>
                  </View>
                  <View style={styles.growthStat}>
                    <Text style={[styles.growthStatValue, { color: Colors.warning }]}>{streak}</Text>
                    <Text style={[styles.growthStatLabel, { color: colors.textSecondary }]}>Day streak</Text>
                  </View>
                  <View style={styles.growthStat}>
                    <Text style={[styles.growthStatValue, { color: Colors.success }]}>{savedActivities.length}</Text>
                    <Text style={[styles.growthStatLabel, { color: colors.textSecondary }]}>Saved tools</Text>
                  </View>
                  <View style={styles.growthStat}>
                    <Text style={[styles.growthStatValue, { color: Colors.accent }]}>{journalEntries.length}</Text>
                    <Text style={[styles.growthStatLabel, { color: colors.textSecondary }]}>Journal entries</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your level progress</Text>
              <View style={[styles.levelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.levelRow}>
                  <Text style={[styles.levelTitle, { color: colors.text }]}>Level {xpLevel}</Text>
                  <Text style={[styles.levelXp, { color: colors.textMuted }]}>{xpInLevel}/100 XP</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: isDark ? "#2D3748" : "#E0F2FE" }]}>
                  <View style={[styles.progressFill, { width: `${xpInLevel}%` }]} />
                </View>
                <Text style={[styles.levelHint, { color: colors.textSecondary }]}>Complete activities to earn XP and level up</Text>
              </View>

              {diagnosticResults.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Wellbeing checks</Text>
                  {diagnosticResults.slice(0, 3).map((r, i) => (
                    <View key={i} style={[styles.diagnosticCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View>
                        <Text style={[styles.diagDate, { color: colors.textMuted }]}>
                          {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </Text>
                        <Text style={[styles.diagSeverity, { color: colors.text }]}>{r.severity}</Text>
                      </View>
                      <Text style={[styles.diagScore, { color: Colors.primary }]}>{r.totalScore}/56</Text>
                    </View>
                  ))}
                </>
              )}

              <View style={[styles.affirmCard, { backgroundColor: isDark ? "#1E1A3D" : "#F5F0FF" }]}>
                <Text style={[styles.affirmText, { color: isDark ? Colors.accent : "#7C3AED" }]}>
                  "You showed up for yourself today."
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal visible={showJournalModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowJournalModal(false)}>
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New journal entry</Text>
            <Pressable onPress={handleSaveJournal}>
              <Text style={[styles.modalSave, { color: Colors.accentPink }]}>Save</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={[styles.journalPrompt, { color: colors.textSecondary }]}>
              What's on your mind? This is private and only visible to you.
            </Text>
            <TextInput
              style={[styles.journalInput, { color: colors.text }]}
              placeholder="Start writing..."
              placeholderTextColor={colors.textMuted}
              multiline
              value={journalText}
              onChangeText={setJournalText}
              autoFocus
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>

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
  emptyState: {
    alignItems: "center", padding: 40, borderRadius: 24, borderWidth: 1.5, borderStyle: "dashed",
  },
  emptyTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 17, marginBottom: 6 },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  emptyBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#fff" },
  savedCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 16,
    borderRadius: 18, borderWidth: 1.5, marginBottom: 12,
  },
  savedTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, marginBottom: 4 },
  savedDesc: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 6 },
  savedDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  newJournalBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 16, marginBottom: 16,
  },
  newJournalBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#fff" },
  journalCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  journalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  journalDate: { fontFamily: "Inter_400Regular", fontSize: 12 },
  journalText: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  sectionTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 6 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 16 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  contentCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  contentCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  contentTypeIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  contentTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 4, flex: 1 },
  contentMeta: { flexDirection: "row", alignItems: "center" },
  contentType: { fontFamily: "Inter_500Medium", fontSize: 12, textTransform: "capitalize" },
  contentDot: { fontFamily: "Inter_400Regular", fontSize: 12 },
  contentDuration: { fontFamily: "Inter_400Regular", fontSize: 12 },
  contentExpanded: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(100,116,139,0.15)" },
  contentDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginBottom: 8 },
  keyPointRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  keyPointDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  keyPointText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, lineHeight: 19 },
  contentSource: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 8 },
  libraryFooter: { borderRadius: 18, padding: 18, marginTop: 4, marginBottom: 8, alignItems: "center" },
  libraryFooterText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20, fontStyle: "italic" },
  growthCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  growthTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, marginBottom: 16 },
  growthStats: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  growthStat: { flex: 1, alignItems: "center", minWidth: "40%" },
  growthStatValue: { fontFamily: "Poppins_700Bold", fontSize: 32 },
  growthStatLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  levelCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  levelTitle: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  levelXp: { fontFamily: "Inter_400Regular", fontSize: 13 },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", backgroundColor: Colors.success, borderRadius: 4 },
  levelHint: { fontFamily: "Inter_400Regular", fontSize: 12 },
  diagnosticCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10,
  },
  diagDate: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 2 },
  diagSeverity: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  diagScore: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  affirmCard: { borderRadius: 20, padding: 20, marginTop: 4 },
  affirmText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, fontStyle: "italic", textAlign: "center" },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  modalSave: { fontFamily: "Poppins_600SemiBold", fontSize: 16 },
  journalPrompt: { fontFamily: "Inter_400Regular", fontSize: 14, marginBottom: 20, lineHeight: 20 },
  journalInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 26 },
});
