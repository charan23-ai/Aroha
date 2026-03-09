import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CycleEntry } from "@/lib/menstrualEngine";

export type UserProfile = {
  name: string;
  age: string;
  gender: string;
  state: string;
  district: string;
  concerns: string[];
  onboardingComplete: boolean;
  initialMood: number;
};

export type JournalEntry = {
  id: string;
  content: string;
  createdAt: string;
  mood?: number;
};

export type SavedActivity = {
  id: string;
  taskId: string;
  taskTitle: string;
  savedAt: string;
};

export type WaterEntry = {
  date: string;
  glasses: number;
};

export type SleepEntry = {
  date: string;
  hours: number;
};

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export type DiagnosticResult = {
  scores: number[];
  date: string;
  totalScore: number;
  severity: string;
};

export type MoodHistoryEntry = {
  date: string;
  score: number;
};

type AppContextValue = {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  xp: number;
  addXp: (amount: number) => void;
  streak: number;
  journalEntries: JournalEntry[];
  addJournalEntry: (content: string, mood?: number) => void;
  deleteJournalEntry: (id: string) => void;
  savedActivities: SavedActivity[];
  saveActivity: (taskId: string, taskTitle: string) => void;
  removeSavedActivity: (id: string) => void;
  waterToday: number;
  setWaterToday: (n: number) => void;
  sleepToday: number;
  setSleepToday: (n: number) => void;
  todos: TodoItem[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  diagnosticResults: DiagnosticResult[];
  addDiagnosticResult: (result: DiagnosticResult) => void;
  cycleEntries: CycleEntry[];
  addCycleEntry: (entry: Omit<CycleEntry, "id">) => void;
  updateCycleEntry: (id: string, updates: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  moodHistory: MoodHistoryEntry[];
  logMood: (score: number) => void;
  waterHistory: number[];
  sleepHistory: number[];
  isLoaded: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const KEYS = {
  profile: "@aroha_profile",
  xp: "@aroha_xp",
  streak: "@aroha_streak",
  lastActive: "@aroha_last_active",
  journal: "@aroha_journal",
  saved: "@aroha_saved",
  water: "@aroha_water",
  sleep: "@aroha_sleep",
  todos: "@aroha_todos",
  diagnostic: "@aroha_diagnostic",
  cycle: "@aroha_cycle",
  moodHistory: "@aroha_mood_history",
};

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
  const [waterToday, setWaterTodayState] = useState(0);
  const [sleepToday, setSleepTodayState] = useState(0);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);
  const [waterHistoryData, setWaterHistoryData] = useState<Record<string, number>>({});
  const [sleepHistoryData, setSleepHistoryData] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      try {
        const [profileStr, xpStr, streakStr, lastActiveStr, journalStr, savedStr, waterStr, sleepStr, todosStr, diagnosticStr, cycleStr, moodHistStr] = await Promise.all([
          AsyncStorage.getItem(KEYS.profile),
          AsyncStorage.getItem(KEYS.xp),
          AsyncStorage.getItem(KEYS.streak),
          AsyncStorage.getItem(KEYS.lastActive),
          AsyncStorage.getItem(KEYS.journal),
          AsyncStorage.getItem(KEYS.saved),
          AsyncStorage.getItem(KEYS.water),
          AsyncStorage.getItem(KEYS.sleep),
          AsyncStorage.getItem(KEYS.todos),
          AsyncStorage.getItem(KEYS.diagnostic),
          AsyncStorage.getItem(KEYS.cycle),
          AsyncStorage.getItem(KEYS.moodHistory),
        ]);

        if (profileStr) setProfileState(JSON.parse(profileStr));
        if (xpStr) setXp(parseInt(xpStr, 10));
        if (journalStr) setJournalEntries(JSON.parse(journalStr));
        if (savedStr) setSavedActivities(JSON.parse(savedStr));
        if (todosStr) setTodos(JSON.parse(todosStr));
        if (diagnosticStr) setDiagnosticResults(JSON.parse(diagnosticStr));
        if (cycleStr) setCycleEntries(JSON.parse(cycleStr));
        if (moodHistStr) setMoodHistory(JSON.parse(moodHistStr));

        const today = getTodayKey();

        const waterData = waterStr ? JSON.parse(waterStr) : {};
        setWaterTodayState(waterData[today] || 0);
        setWaterHistoryData(waterData);

        const sleepData = sleepStr ? JSON.parse(sleepStr) : {};
        setSleepTodayState(sleepData[today] || 0);
        setSleepHistoryData(sleepData);

        let newStreak = streakStr ? parseInt(streakStr, 10) : 0;
        if (lastActiveStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toISOString().split("T")[0];
          if (lastActiveStr !== today && lastActiveStr !== yesterdayKey) {
            newStreak = 0;
          }
        }
        if (!lastActiveStr || lastActiveStr !== today) {
          newStreak = Math.max(newStreak + (lastActiveStr ? 1 : 1), 1);
          await AsyncStorage.setItem(KEYS.lastActive, today);
          await AsyncStorage.setItem(KEYS.streak, String(newStreak));
        }
        setStreak(newStreak);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const setProfile = async (p: UserProfile) => {
    setProfileState(p);
    await AsyncStorage.setItem(KEYS.profile, JSON.stringify(p));
  };

  const addXp = async (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    await AsyncStorage.setItem(KEYS.xp, String(newXp));
  };

  const addJournalEntry = async (content: string, mood?: number) => {
    const entry: JournalEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      mood,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    await AsyncStorage.setItem(KEYS.journal, JSON.stringify(updated));
  };

  const deleteJournalEntry = async (id: string) => {
    const updated = journalEntries.filter((e) => e.id !== id);
    setJournalEntries(updated);
    await AsyncStorage.setItem(KEYS.journal, JSON.stringify(updated));
  };

  const saveActivity = async (taskId: string, taskTitle: string) => {
    if (savedActivities.find((s) => s.taskId === taskId)) return;
    const item: SavedActivity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      taskId,
      taskTitle,
      savedAt: new Date().toISOString(),
    };
    const updated = [item, ...savedActivities];
    setSavedActivities(updated);
    await AsyncStorage.setItem(KEYS.saved, JSON.stringify(updated));
  };

  const removeSavedActivity = async (id: string) => {
    const updated = savedActivities.filter((s) => s.id !== id);
    setSavedActivities(updated);
    await AsyncStorage.setItem(KEYS.saved, JSON.stringify(updated));
  };

  const setWaterToday = async (n: number) => {
    setWaterTodayState(n);
    const newData = { ...waterHistoryData, [getTodayKey()]: n };
    setWaterHistoryData(newData);
    await AsyncStorage.setItem(KEYS.water, JSON.stringify(newData));
  };

  const setSleepToday = async (n: number) => {
    setSleepTodayState(n);
    const newData = { ...sleepHistoryData, [getTodayKey()]: n };
    setSleepHistoryData(newData);
    await AsyncStorage.setItem(KEYS.sleep, JSON.stringify(newData));
  };

  const addTodo = async (text: string) => {
    const item: TodoItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...todos, item];
    setTodos(updated);
    await AsyncStorage.setItem(KEYS.todos, JSON.stringify(updated));
  };

  const toggleTodo = async (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTodos(updated);
    await AsyncStorage.setItem(KEYS.todos, JSON.stringify(updated));
  };

  const deleteTodo = async (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    await AsyncStorage.setItem(KEYS.todos, JSON.stringify(updated));
  };

  const addDiagnosticResult = async (result: DiagnosticResult) => {
    const updated = [result, ...diagnosticResults];
    setDiagnosticResults(updated);
    await AsyncStorage.setItem(KEYS.diagnostic, JSON.stringify(updated));
  };

  const addCycleEntry = async (entry: Omit<CycleEntry, "id">) => {
    const newEntry: CycleEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [newEntry, ...cycleEntries];
    setCycleEntries(updated);
    await AsyncStorage.setItem(KEYS.cycle, JSON.stringify(updated));
  };

  const updateCycleEntry = async (id: string, updates: Partial<CycleEntry>) => {
    const updated = cycleEntries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setCycleEntries(updated);
    await AsyncStorage.setItem(KEYS.cycle, JSON.stringify(updated));
  };

  const deleteCycleEntry = async (id: string) => {
    const updated = cycleEntries.filter((e) => e.id !== id);
    setCycleEntries(updated);
    await AsyncStorage.setItem(KEYS.cycle, JSON.stringify(updated));
  };

  const logMood = async (score: number) => {
    const today = getTodayKey();
    const exists = moodHistory.find((m) => m.date === today);
    let updated: MoodHistoryEntry[];
    if (exists) {
      updated = moodHistory.map((m) => (m.date === today ? { ...m, score } : m));
    } else {
      updated = [...moodHistory, { date: today, score }];
    }
    setMoodHistory(updated);
    await AsyncStorage.setItem(KEYS.moodHistory, JSON.stringify(updated));
  };

  const waterHistory = useMemo(() => {
    return getLast7Days().map((d) => waterHistoryData[d] || 0);
  }, [waterHistoryData]);

  const sleepHistory = useMemo(() => {
    return getLast7Days().map((d) => sleepHistoryData[d] || 0);
  }, [sleepHistoryData]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      xp,
      addXp,
      streak,
      journalEntries,
      addJournalEntry,
      deleteJournalEntry,
      savedActivities,
      saveActivity,
      removeSavedActivity,
      waterToday,
      setWaterToday,
      sleepToday,
      setSleepToday,
      todos,
      addTodo,
      toggleTodo,
      deleteTodo,
      diagnosticResults,
      addDiagnosticResult,
      cycleEntries,
      addCycleEntry,
      updateCycleEntry,
      deleteCycleEntry,
      moodHistory,
      logMood,
      waterHistory,
      sleepHistory,
      isLoaded,
    }),
    [profile, xp, streak, journalEntries, savedActivities, waterToday, sleepToday, todos, diagnosticResults, cycleEntries, moodHistory, waterHistory, sleepHistory, isLoaded]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
