export type PeriodPhase = "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";

export type PhaseSupport = {
  phase: PeriodPhase;
  phaseLabel: string;
  phaseDesc: string;
  energyLevel: "low" | "medium" | "high";
  actions: string[];
  emotionalPrompt: string;
  cbtExercise?: string;
  breathingNote?: string;
};

export type CycleEntry = {
  id: string;
  startDate: string;
  cycleLength: number;
  symptoms: string[];
  mood: number;
  notes: string;
};

export function predictNextPeriod(lastPeriodDate: string, cycleLength = 28): string {
  const start = new Date(lastPeriodDate);
  const next = new Date(start);
  next.setDate(start.getDate() + cycleLength);
  return next.toISOString().split("T")[0];
}

export function getDayOfCycle(lastPeriodDate: string): number {
  const start = new Date(lastPeriodDate);
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1;
}

export function getCurrentPhase(dayOfCycle: number, cycleLength = 28): PeriodPhase {
  if (dayOfCycle <= 5) return "menstrual";
  if (dayOfCycle <= 13) return "follicular";
  if (dayOfCycle <= 16) return "ovulation";
  if (dayOfCycle <= cycleLength) return "luteal";
  return "unknown";
}

export function getPhaseSupport(phase: PeriodPhase): PhaseSupport {
  switch (phase) {
    case "menstrual":
      return {
        phase,
        phaseLabel: "Menstrual phase",
        phaseDesc: "Days 1-5 · Your body is releasing the uterine lining",
        energyLevel: "low",
        actions: [
          "Use a warm heating pad on your lower abdomen",
          "Try a gentle child's pose stretch",
          "Drink warm ginger or chamomile tea",
          "Rest more than usual — this is needed, not lazy",
        ],
        emotionalPrompt: "What would it feel like to treat your body with kindness today?",
        breathingNote: "Slow, gentle breaths reduce cramping by relaxing the uterine muscles.",
      };
    case "follicular":
      return {
        phase,
        phaseLabel: "Follicular phase",
        phaseDesc: "Days 6-13 · Rising energy and clarity",
        energyLevel: "medium",
        actions: [
          "This is a great time to start new projects",
          "Your social energy tends to be higher now",
          "Try a new activity or revisit something creative",
          "Build on habits you want to establish",
        ],
        emotionalPrompt: "What feels exciting or possible to begin right now?",
        cbtExercise: "Use this clearer headspace to challenge a long-held limiting belief.",
      };
    case "ovulation":
      return {
        phase,
        phaseLabel: "Ovulation phase",
        phaseDesc: "Days 14-16 · Peak energy and connection",
        energyLevel: "high",
        actions: [
          "You may feel most confident and outgoing now",
          "Great time for important conversations",
          "Physical energy is usually at its highest",
          "Connect with people you care about",
        ],
        emotionalPrompt: "What's one meaningful thing you want to do or say today?",
      };
    case "luteal":
      return {
        phase,
        phaseLabel: "Luteal phase",
        phaseDesc: "Days 17-28 · Inward energy, possible PMS",
        energyLevel: "low",
        actions: [
          "Reduce caffeine and salty foods to ease bloating",
          "Prioritize sleep more than usual",
          "Be gentle with yourself if you feel more emotional",
          "Light exercise like walking helps mood",
        ],
        emotionalPrompt: "What does your body need most right now?",
        cbtExercise: "Is there another possible explanation for what I'm feeling right now? Hormones can amplify emotions — that doesn't make them less real, but it helps to know.",
        breathingNote: "4-7-8 breathing can ease PMS symptoms — breathe in 4, hold 7, out 8.",
      };
    default:
      return {
        phase: "unknown",
        phaseLabel: "Cycle tracking",
        phaseDesc: "Log your last period to see phase-based support",
        energyLevel: "medium",
        actions: ["Log your last period date to unlock personalized support"],
        emotionalPrompt: "How is your body feeling right now?",
      };
  }
}

export const periodSymptoms = [
  "Cramps", "Bloating", "Fatigue", "Headache", "Back pain",
  "Mood swings", "Irritability", "Breast tenderness", "Nausea", "Acne",
  "Food cravings", "Difficulty sleeping", "Low energy", "Anxiety",
];

export function getSymptomSupport(symptom: string): string[] {
  const supports: Record<string, string[]> = {
    Cramps: ["Apply warmth to your lower abdomen", "Gentle knees-to-chest stretch", "Magnesium-rich foods can help (dark chocolate, nuts)"],
    Bloating: ["Eat potassium-rich foods (banana, spinach)", "Reduce salty snacks", "Drink one extra glass of water", "Light walking reduces bloating"],
    Fatigue: ["Take a 10-minute restorative rest", "Drink warm water", "Iron-rich foods help (leafy greens, lentils)", "Be kind — your body is working hard"],
    Headache: ["Stay hydrated", "Cool compress on the forehead", "Reduce screen time if possible"],
    "Mood swings": ["Try box breathing — 4 in, 4 hold, 4 out, 4 hold", "Name the emotion without judging it", "DBT: ride the emotion wave — it will pass"],
    Irritability: ["5-4-3-2-1 grounding technique", "Take a short walk", "What happened just before you felt irritated? Journal it."],
    Anxiety: ["Slow exhale (longer than inhale) activates the rest system", "Cold water on wrists can calm your nervous system", "Name 5 things you can see around you"],
  };
  return supports[symptom] || ["Rest and be gentle with yourself", "Stay hydrated", "Honour what your body needs"];
}

export function analyzeCyclePatterns(entries: CycleEntry[]): string {
  if (entries.length < 2) {
    return "Track more cycles to reveal your personal patterns.";
  }
  const lowMoodDays = entries.filter((e) => e.mood < 4).length;
  const hasIrritability = entries.some((e) => e.symptoms.includes("Irritability") || e.symptoms.includes("Mood swings"));

  if (lowMoodDays > entries.length * 0.6) {
    return "Your mood tends to be lower around your cycle. This is common — hormonal shifts can deepen emotions. Gentle self-care and grounding tools may help.";
  }
  if (hasIrritability) {
    return "Irritability appears in some of your cycles. This could be linked to hormonal shifts in the luteal phase. Tracking helps you anticipate and prepare.";
  }
  return "Your cycle data is building. Keep tracking to reveal your personal emotional patterns.";
}
