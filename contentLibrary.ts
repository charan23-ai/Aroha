export type ContentItem = {
  id: string;
  title: string;
  type: "article" | "exercise" | "lesson" | "guide";
  category: "anxiety" | "sleep" | "confidence" | "relationships" | "focus" | "emotions" | "burnout";
  duration: string;
  description: string;
  keyPoints: string[];
  source: string;
};

export const contentLibrary: ContentItem[] = [
  {
    id: "anxiety_what",
    title: "What is Anxiety?",
    type: "article",
    category: "anxiety",
    duration: "3 min read",
    description: "Understanding the difference between normal worry and anxiety that needs attention.",
    keyPoints: [
      "Anxiety is your brain's alarm system — it evolved to protect you",
      "Short-term anxiety is helpful; persistent anxiety can be managed",
      "Physical symptoms (fast heartbeat, tension) are your nervous system activating",
      "You can train your nervous system to respond differently over time",
    ],
    source: "CBT Research Basis",
  },
  {
    id: "sleep_mood",
    title: "Why Sleep Impacts Your Mood",
    type: "lesson",
    category: "sleep",
    duration: "4 min read",
    description: "The science behind how sleep directly shapes how you feel the next day.",
    keyPoints: [
      "Your brain processes emotions during REM sleep",
      "Even 1 hour less sleep can increase emotional reactivity by 60%",
      "Consistent sleep times matter more than total hours",
      "Blue light from screens delays melatonin by up to 3 hours",
    ],
    source: "Sleep Neuroscience",
  },
  {
    id: "breathing_calm",
    title: "Breathing to Calm Your Brain",
    type: "exercise",
    category: "anxiety",
    duration: "3 min",
    description: "A science-backed breathing technique that activates your body's calm response.",
    keyPoints: [
      "Slow exhales activate the parasympathetic (rest) nervous system",
      "4-7-8 breathing: inhale 4, hold 7, exhale 8",
      "Box breathing: 4 in, 4 hold, 4 out, 4 hold",
      "Even 3 minutes can lower cortisol levels measurably",
    ],
    source: "Neuroscience of Breathing",
  },
  {
    id: "inner_critic",
    title: "Taming Your Inner Critic",
    type: "guide",
    category: "confidence",
    duration: "5 min read",
    description: "Why your self-critical voice exists and how to stop letting it run the show.",
    keyPoints: [
      "The inner critic is not you — it's a pattern formed to protect you",
      "Naming the critic weakens its power (e.g., call it 'The Worrier')",
      "CBT: examine the evidence for and against what it says",
      "Self-compassion is not weakness — it's neurologically proven to build resilience",
    ],
    source: "CBT Self-Compassion Framework",
  },
  {
    id: "emotional_numbness",
    title: "Understanding Emotional Numbness",
    type: "article",
    category: "emotions",
    duration: "4 min read",
    description: "When you can't feel much — what's happening and how to gently reconnect.",
    keyPoints: [
      "Emotional numbness is a protective response to overwhelm",
      "It's different from depression but can overlap",
      "Small sensory inputs (cold water, smell, texture) can re-activate feelings",
      "DBT Opposite Action: doing the opposite of isolation slowly rebuilds emotional connection",
    ],
    source: "DBT Emotional Regulation",
  },
  {
    id: "study_burnout",
    title: "Academic Burnout Is Real",
    type: "article",
    category: "burnout",
    duration: "4 min read",
    description: "Why student burnout happens and what science says about recovering from it.",
    keyPoints: [
      "Burnout is not laziness — it's the brain depleting its reserves",
      "Chronic stress shrinks the prefrontal cortex over time",
      "Rest is not wasted time — it is when the brain consolidates learning",
      "Micro-recovery (5 min breaks) is more effective than long breaks in the evening",
    ],
    source: "Educational Psychology Research",
  },
  {
    id: "peer_pressure",
    title: "Why Peer Pressure Feels So Hard to Resist",
    type: "lesson",
    category: "relationships",
    duration: "3 min read",
    description: "The neuroscience of why belonging feels urgent and how to stay true to yourself.",
    keyPoints: [
      "The teenage brain is hyper-sensitive to social rejection due to development",
      "Belonging is a survival need, not vanity",
      "Knowing your values gives you a reference point when pressure comes",
      "Saying no becomes easier when framed as 'this isn't me' not 'I won't'",
    ],
    source: "Adolescent Neuroscience",
  },
  {
    id: "focus_tips",
    title: "Reclaiming Focus in a Distracted World",
    type: "guide",
    category: "focus",
    duration: "5 min read",
    description: "Practical, research-backed ways to protect your attention and think more clearly.",
    keyPoints: [
      "Each notification triggers a stress hormone spike",
      "Deep focus takes 23 minutes to re-enter after an interruption",
      "Phone-free periods activate your default mode network (creativity zone)",
      "The Pomodoro method (25 min on, 5 off) works with the brain's natural rhythm",
    ],
    source: "Cognitive Science of Attention",
  },
  {
    id: "loneliness_connection",
    title: "The Science of Loneliness",
    type: "article",
    category: "relationships",
    duration: "4 min read",
    description: "Why loneliness is one of the most painful human experiences and how to address it.",
    keyPoints: [
      "Loneliness activates the same brain region as physical pain",
      "Quality of connection matters far more than quantity",
      "Microconnections (brief positive interactions) build belonging incrementally",
      "Online interaction can help but doesn't fully replace in-person connection",
    ],
    source: "Social Neuroscience Research",
  },
  {
    id: "gratitude_science",
    title: "Why Gratitude Actually Works",
    type: "lesson",
    category: "emotions",
    duration: "3 min read",
    description: "The neurological mechanism behind gratitude and why it changes how you feel.",
    keyPoints: [
      "Gratitude activates dopamine and serotonin simultaneously",
      "Writing 3 things down (not just thinking them) amplifies the effect",
      "Specificity matters — 'the warm coffee this morning' works better than 'coffee'",
      "Consistent practice creates lasting neural pathways for positivity",
    ],
    source: "Positive Psychology Research",
  },
];

export function getContentByCategory(category: ContentItem["category"]): ContentItem[] {
  return contentLibrary.filter((c) => c.category === category);
}

export function getContentById(id: string): ContentItem | undefined {
  return contentLibrary.find((c) => c.id === id);
}

export const contentCategories: { id: ContentItem["category"]; label: string; icon: string }[] = [
  { id: "anxiety", label: "Anxiety", icon: "cloud" },
  { id: "sleep", label: "Sleep", icon: "moon" },
  { id: "confidence", label: "Confidence", icon: "sun" },
  { id: "relationships", label: "Relationships", icon: "users" },
  { id: "focus", label: "Focus", icon: "target" },
  { id: "emotions", label: "Emotions", icon: "heart" },
  { id: "burnout", label: "Burnout", icon: "zap" },
];
