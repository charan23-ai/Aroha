export type HAMAResult = {
  totalScore: number;
  severity: "Mild" | "Mild-Moderate" | "Moderate-Severe" | "High";
  psychicScore: number;
  somaticScore: number;
  insight: string;
  recommendation: string;
};

export const hamaQuestions = [
  { id: 0, text: "Anxious mood", description: "Worries, anticipation of the worst, fearful anticipation, irritability" },
  { id: 1, text: "Tension", description: "Feelings of tension, fatigability, startle response, moved to tears easily, trembling, restlessness" },
  { id: 2, text: "Fears", description: "Of dark, of strangers, of being left alone, of animals, of traffic, of crowds" },
  { id: 3, text: "Insomnia", description: "Difficulty in falling asleep, broken sleep, unsatisfying sleep and fatigue on waking, dreams, nightmares, night terrors" },
  { id: 4, text: "Intellectual", description: "Difficulty in concentration, poor memory" },
  { id: 5, text: "Depressed mood", description: "Loss of interest, lack of pleasure in hobbies, depression, early waking, diurnal swing" },
  { id: 6, text: "Somatic (muscular)", description: "Pains and aches, twitching, stiffness, myoclonic jerks, grinding of teeth, unsteady voice, increased muscular tone" },
  { id: 7, text: "Somatic (sensory)", description: "Tinnitus, blurring of vision, hot and cold flushes, feelings of weakness, pricking sensation" },
  { id: 8, text: "Cardiovascular symptoms", description: "Tachycardia, palpitations, pain in chest, throbbing of vessels, fainting feelings, missing beat" },
  { id: 9, text: "Respiratory symptoms", description: "Pressure or constriction in chest, choking feelings, sighing, dyspnea" },
  { id: 10, text: "Gastrointestinal symptoms", description: "Difficulty in swallowing, wind, abdominal pain, burning sensations, abdominal fullness, nausea, vomiting, borborygmi, looseness of bowels, loss of weight, constipation" },
  { id: 11, text: "Genitourinary symptoms", description: "Frequency of micturition, urgency of micturition, amenorrhoea, menorrhagia, development of frigidity, premature ejaculation, loss of libido, impotence" },
  { id: 12, text: "Autonomic symptoms", description: "Dry mouth, flushing, pallor, tendency to sweat, giddiness, tension headache, raising of hair" },
  { id: 13, text: "Behaviour at interview", description: "Fidgeting, restlessness or pacing, tremor of hands, furrowed brow, strained face, sighing or rapid respiration, facial pallor, swallowing, etc." },
];

export const hamaLabels = ["Not present", "Mild", "Moderate", "Severe", "Very severe"];

export function calculateHAMA(scores: number[]): HAMAResult {
  if (scores.length !== 14) {
    throw new Error("HAM-A requires 14 responses.");
  }

  const totalScore = scores.reduce((acc, val) => acc + val, 0);

  const psychicIndices = [0, 1, 2, 3, 4, 5, 13];
  const psychicScore = psychicIndices.reduce((acc, i) => acc + scores[i], 0);

  const somaticIndices = [6, 7, 8, 9, 10, 11, 12];
  const somaticScore = somaticIndices.reduce((acc, i) => acc + scores[i], 0);

  let severity: HAMAResult["severity"];
  let insight = "";
  let recommendation = "";

  if (totalScore < 17) {
    severity = "Mild";
    insight = "Your nervous system shows light stress activation.";
    recommendation = "Breathing exercises and short grounding tools may help regulate this.";
  } else if (totalScore <= 24) {
    severity = "Mild-Moderate";
    insight = "You may be experiencing ongoing internal tension.";
    recommendation = "Structured reflection exercises and daily calming rituals could support you.";
  } else if (totalScore <= 30) {
    severity = "Moderate-Severe";
    insight = "Your body and thoughts seem under sustained strain right now.";
    recommendation = "Consider combining daily regulation tools with guided support.";
  } else {
    severity = "High";
    insight = "Your system appears significantly overwhelmed at the moment.";
    recommendation = "It may help to explore professional guidance while using grounding tools.";
  }

  return { totalScore, severity, psychicScore, somaticScore, insight, recommendation };
}

export const quickEvalQuestions = [
  { id: 0, text: "In the last week, have you felt tense, restless, or on edge?", hamIndices: [1, 13] },
  { id: 1, text: "Have you been worrying about things you can't control?", hamIndices: [0, 4] },
  { id: 2, text: "Have you had trouble sleeping because of worry or a racing mind?", hamIndices: [3] },
  { id: 3, text: "Have you felt physical signs of stress — like a tight chest, upset stomach, or headaches?", hamIndices: [8, 9, 10, 12] },
];
