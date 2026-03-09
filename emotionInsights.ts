export type InsightData = {
  moodHistory: number[];
  sleepHistory: number[];
  waterHistory: number[];
  activitiesCompleted: number;
  streakDays: number;
  journalCount: number;
  diagnosticScore?: number;
};

export type Insight = {
  id: string;
  type: "observation" | "pattern" | "suggestion" | "encouragement";
  title: string;
  body: string;
  action?: string;
  actionRoute?: string;
};

export function analyzeEmotionalState(data: InsightData): Insight[] {
  const insights: Insight[] = [];

  const avgMood = data.moodHistory.length > 0
    ? data.moodHistory.reduce((a, b) => a + b, 0) / data.moodHistory.length
    : null;

  const avgSleep = data.sleepHistory.length > 0
    ? data.sleepHistory.reduce((a, b) => a + b, 0) / data.sleepHistory.length
    : null;

  const avgWater = data.waterHistory.length > 0
    ? data.waterHistory.reduce((a, b) => a + b, 0) / data.waterHistory.length
    : null;

  if (avgMood !== null && avgMood < 3) {
    insights.push({
      id: "low_mood",
      type: "observation",
      title: "Your mood has been low recently",
      body: "Consistent low mood can be a signal to slow down and offer yourself more care. This is not a sign of weakness.",
      action: "Try a grounding tool",
      actionRoute: "/(tabs)/untangle",
    });
  }

  if (avgSleep !== null && avgSleep < 6) {
    insights.push({
      id: "low_sleep",
      type: "pattern",
      title: "Sleep and mood are linked",
      body: "You've been sleeping under 6 hours. Reduced sleep directly affects emotional regulation and makes everything feel harder.",
      action: "Log your sleep",
      actionRoute: "/(tabs)/tracking",
    });
  }

  if (avgSleep !== null && avgMood !== null && avgSleep < 6 && avgMood < 4) {
    insights.push({
      id: "sleep_mood_link",
      type: "pattern",
      title: "Your mood dips on low-sleep days",
      body: "Your data shows a pattern — lower sleep tends to correlate with lower mood. Protecting sleep could be one of the most powerful things you do for your emotional health.",
    });
  }

  if (avgWater !== null && avgWater < 4) {
    insights.push({
      id: "low_water",
      type: "suggestion",
      title: "Hydration affects your brain",
      body: "Even mild dehydration can increase anxiety and affect focus. Small glass by your bedside as a reminder can help.",
      action: "Track water today",
      actionRoute: "/(tabs)/tracking",
    });
  }

  if (data.activitiesCompleted >= 3) {
    insights.push({
      id: "activity_positive",
      type: "encouragement",
      title: "You feel lighter after reflection",
      body: "You've completed several exercises. People who engage in regular self-reflection activities report 40% lower stress levels over time.",
    });
  }

  if (data.streakDays >= 3) {
    insights.push({
      id: "streak_momentum",
      type: "encouragement",
      title: `${data.streakDays}-day streak — you're building something`,
      body: "Consistency, even in small doses, rewires how the brain handles stress. You're doing more than you may realize.",
    });
  }

  if (data.journalCount >= 5) {
    insights.push({
      id: "journaling_benefit",
      type: "encouragement",
      title: "Your journal is growing",
      body: "Writing has been shown to reduce the intensity of difficult emotions by up to 30%. Your words are doing real work.",
      action: "Write today",
      actionRoute: "/(tabs)/mindkit",
    });
  }

  if (data.diagnosticScore !== undefined && data.diagnosticScore >= 25) {
    insights.push({
      id: "diagnostic_high",
      type: "suggestion",
      title: "Your last check showed high strain",
      body: "Your nervous system may be under significant load. Professional support alongside self-care tools can make a real difference.",
      action: "View support resources",
      actionRoute: "/professional-help",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "default_encourage",
      type: "encouragement",
      title: "You showed up today",
      body: "Opening this app is a form of self-care. Keep going — your consistent presence here matters.",
    });
  }

  return insights.slice(0, 3);
}

export function getMoodLabel(score: number): string {
  if (score <= 1) return "Very Low";
  if (score <= 2) return "Low";
  if (score <= 3) return "Heavy";
  if (score <= 4) return "Neutral";
  if (score <= 5) return "Okay";
  if (score <= 6) return "Lighter";
  return "Good";
}

export function getInsightIcon(type: Insight["type"]): string {
  switch (type) {
    case "observation": return "eye";
    case "pattern": return "trending-up";
    case "suggestion": return "compass";
    case "encouragement": return "star";
    default: return "info";
  }
}

export function getInsightColor(type: Insight["type"]): string {
  switch (type) {
    case "observation": return "#F97316";
    case "pattern": return "#38BDF8";
    case "suggestion": return "#A78BFA";
    case "encouragement": return "#10B981";
    default: return "#94A3B8";
  }
}
