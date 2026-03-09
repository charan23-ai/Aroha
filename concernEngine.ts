export type Task = {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "breathing" | "reflection" | "journaling" | "visualization" | "grounding";
  steps: TaskStep[];
};

export type TaskStep = {
  type: "breathing" | "text" | "input" | "choice" | "visualization";
  title: string;
  content: string;
  duration?: number;
  choices?: string[];
};

export type Concern = {
  id: string;
  label: string;
  phrase: string;
  icon: string;
};

export const concerns: Concern[] = [
  { id: "anxiety", label: "Anxiety / Overthinking", phrase: "I can't stop overthinking", icon: "cloud" },
  { id: "emotional_numbness", label: "Emotional Numbness", phrase: "I feel numb or tired all the time", icon: "moon" },
  { id: "fear_of_failure", label: "Fear of Failure", phrase: "I'm scared I'll fail", icon: "alert-triangle" },
  { id: "low_self_esteem", label: "Low Self Esteem", phrase: "I feel left out or not good enough", icon: "heart" },
  { id: "peer_pressure", label: "Peer Pressure", phrase: "I'm scared of disappointing my parents", icon: "users" },
  { id: "relationship_issues", label: "Relationship Issues", phrase: "They ghosted me and I don't know why", icon: "link" },
  { id: "academic_burnout", label: "Academic Burnout", phrase: "I'm mentally exhausted from studying", icon: "book" },
  { id: "loneliness", label: "Loneliness", phrase: "I feel alone even when surrounded by people", icon: "user" },
  { id: "mood_swings", label: "Mood Swings", phrase: "My emotions change rapidly", icon: "activity" },
];

const taskDatabase: Record<string, Task[]> = {
  anxiety: [
    {
      id: "3facts1fear",
      title: "3 Facts + 1 Fear",
      description: "Separate facts from imagined outcomes",
      duration: "5 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Let's separate what's real from what's feared", content: "When we're anxious, our mind mixes facts with fears. This exercise helps you see them clearly." },
        { type: "input", title: "Write down your fear", content: "What's the thing you're most anxious about right now?" },
        { type: "input", title: "Fact 1", content: "What is definitely true about this situation? (not a guess, a real fact)" },
        { type: "input", title: "Fact 2", content: "What else is factually true? Look for something grounding." },
        { type: "input", title: "Fact 3", content: "One more real fact. You're doing great." },
        { type: "text", title: "Notice the difference", content: "You just separated your fear from what's actually real. Most fears shrink when we do this. You showed up for yourself." },
      ],
    },
    {
      id: "boxbreathing",
      title: "Box Breathing",
      description: "Calm your nervous system with guided breathing",
      duration: "4 min",
      type: "breathing",
      steps: [
        { type: "text", title: "Box breathing calms your system", content: "This technique is used by Navy SEALs and therapists alike. 4 counts in, hold, out, hold." },
        { type: "breathing", title: "Let's breathe together", content: "Follow the circle. 4 counts in, 4 hold, 4 out, 4 hold.", duration: 240 },
        { type: "text", title: "Your nervous system thanks you", content: "Box breathing activates your parasympathetic system — the one that tells your body you're safe. You can use this anytime." },
      ],
    },
    {
      id: "minddump",
      title: "Mind Dump",
      description: "Release racing thoughts onto paper",
      duration: "7 min",
      type: "journaling",
      steps: [
        { type: "text", title: "Let it all out", content: "There's no right or wrong here. Just write whatever is in your head. Unfiltered. Private. Yours." },
        { type: "input", title: "Brain dump", content: "Write everything that's on your mind right now. Don't edit yourself." },
        { type: "text", title: "Notice how you feel", content: "Externalizing thoughts gives your brain a break. It no longer has to hold all of that. Feel a little lighter?" },
      ],
    },
    {
      id: "worrytime",
      title: "Scheduled Worry Time",
      description: "Contain your worries to regain control",
      duration: "6 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Give your worries a container", content: "Your worries are real, but they don't need your full attention all day. We're going to give them a dedicated time." },
        { type: "input", title: "List your current worries", content: "Write down what's worrying you right now. Getting them out removes their power." },
        { type: "choice", title: "When will you revisit these?", content: "Choose a specific worry time for today:", choices: ["After school/work", "Before dinner", "8pm tonight", "Tomorrow morning"] },
        { type: "text", title: "Deal made", content: "Until that time, when a worry pops up, gently remind yourself: 'I have a time for this.' This is a real CBT technique that works." },
      ],
    },
    {
      id: "54321",
      title: "5-4-3-2-1 Grounding",
      description: "Anchor yourself in the present moment",
      duration: "5 min",
      type: "grounding",
      steps: [
        { type: "text", title: "Your senses are an anchor", content: "When anxiety pulls you into the future, your senses bring you back to now. Let's use them." },
        { type: "input", title: "5 things you can SEE", content: "Look around. Name 5 things you can see right now." },
        { type: "input", title: "4 things you can TOUCH", content: "Feel your surroundings. What textures, temperatures, or sensations do you notice?" },
        { type: "input", title: "3 things you can HEAR", content: "Listen carefully. What sounds are around you, even soft ones?" },
        { type: "input", title: "2 things you can SMELL", content: "Take a deep breath. What can you smell?" },
        { type: "input", title: "1 thing you can TASTE", content: "What do you taste right now?" },
        { type: "text", title: "You're here. You're safe.", content: "Your body just checked in with the present moment. Anxiety lives in the future — you just came back to now." },
      ],
    },
  ],
  academic_burnout: [
    {
      id: "microgoals",
      title: "Micro Goals Reset",
      description: "Break tasks into tiny achievable wins",
      duration: "6 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Burnout happens when tasks feel infinite", content: "The antidote is making things so small, starting becomes easy." },
        { type: "input", title: "What's the overwhelming task?", content: "Write the thing that's making you feel most burned out." },
        { type: "input", title: "Break it into 3 tiny steps", content: "What's the smallest possible first step? Then second? Then third?" },
        { type: "text", title: "Start with just step 1", content: "Don't think about the rest. Just the first tiny step. That's enough for today." },
      ],
    },
    {
      id: "selfcompassion",
      title: "Self-Compassion Pause",
      description: "Speak to yourself like a friend",
      duration: "4 min",
      type: "journaling",
      steps: [
        { type: "text", title: "You wouldn't speak to a friend this way", content: "When we're burned out, our inner voice gets harsh. Let's change that." },
        { type: "input", title: "What are you saying to yourself?", content: "Write the harsh things you've been telling yourself about school or work." },
        { type: "input", title: "Now say it like a kind friend would", content: "Rewrite those same thoughts, but as if you were talking to someone you love." },
        { type: "text", title: "That voice is available to you anytime", content: "You deserve the same kindness you'd give others. One small step is enough." },
      ],
    },
    {
      id: "energycheck",
      title: "Energy Mapping",
      description: "Track when your brain works best",
      duration: "5 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Work with your brain, not against it", content: "Most burnout comes from working when our brain is empty. Let's find your peak time." },
        { type: "choice", title: "When do you feel most alert?", content: "Pick the time of day your mind is sharpest:", choices: ["Early morning (6-9am)", "Mid-morning (9am-12pm)", "Afternoon (1-4pm)", "Evening (6-9pm)"] },
        { type: "input", title: "What drains you most?", content: "What activity or situation leaves you feeling empty?" },
        { type: "text", title: "Protect your energy", content: "Schedule hard tasks during your peak time and easy ones when you're low. This single change can transform productivity." },
      ],
    },
    {
      id: "priority3",
      title: "Rule of 3",
      description: "Focus only on three key tasks today",
      duration: "5 min",
      type: "reflection",
      steps: [
        { type: "text", title: "You can't do everything. And that's okay.", content: "The most effective students and professionals pick three things to focus on each day." },
        { type: "input", title: "Your 3 things for today", content: "What are the 3 most important things you need to do? Just 3." },
        { type: "text", title: "Everything else is a bonus", content: "If you complete your 3 things, you've won today. Anything extra is a gift, not an expectation." },
      ],
    },
    {
      id: "screenreset",
      title: "Digital Reset",
      description: "Reduce cognitive overload",
      duration: "8 min",
      type: "visualization",
      steps: [
        { type: "text", title: "Your brain needs offline time", content: "Every notification, every scroll, every ping takes a tiny piece of your focus. Let's reclaim it." },
        { type: "choice", title: "What's your digital habit right now?", content: "Be honest with yourself:", choices: ["Scrolling every few minutes", "Phone on desk while studying", "Checking phone before bed", "All of the above"] },
        { type: "input", title: "One digital boundary you'll set today", content: "What's one specific change you can make? (e.g., no phone for 30 mins while studying)" },
        { type: "visualization", title: "Visualize your focused self", content: "Close your eyes. Picture yourself working without distraction. How does that feel? What do you accomplish?" },
      ],
    },
  ],
  loneliness: [
    {
      id: "connectionmap",
      title: "Connection Map",
      description: "Identify safe people in your circle",
      duration: "7 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Loneliness isn't about being alone", content: "It's about feeling unseen. Let's map who actually makes you feel safe." },
        { type: "input", title: "Who makes you feel safe?", content: "List people — family, friends, even online — who you can be real with." },
        { type: "input", title: "Who do you miss?", content: "Is there someone you've drifted from that you'd like to reconnect with?" },
        { type: "text", title: "Connection is closer than you think", content: "You have people. Sometimes we just need to remind ourselves they're there." },
      ],
    },
    {
      id: "selfvalidation",
      title: "Self-Validation Script",
      description: "Acknowledge your own feelings",
      duration: "5 min",
      type: "journaling",
      steps: [
        { type: "text", title: "You don't need someone to validate you", content: "Though it would be nice. You can learn to be your own witness." },
        { type: "input", title: "What feeling do you need to be seen for?", content: "What emotion have you been carrying that nobody knows about?" },
        { type: "input", title: "Write yourself a validating message", content: "What would a kind person say to you about what you're feeling?" },
        { type: "text", title: "Your feelings are real and they matter", content: "This space is yours. You showed up for yourself today." },
      ],
    },
  ],
  emotional_numbness: [
    {
      id: "opposite_action",
      title: "Opposite Action",
      description: "Gently wake up your emotions",
      duration: "6 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Numbness is your mind protecting you", content: "It's a shield. But sometimes we need to gently peek behind it." },
        { type: "choice", title: "What do you normally do when numb?", content: "Which of these sounds familiar:", choices: ["Scroll endlessly", "Sleep more than usual", "Avoid people", "Go through the motions"] },
        { type: "text", title: "Try the opposite", content: "DBT's Opposite Action means doing the opposite of what numbness tells you. Not big — tiny. Step outside. Text one person. Put on music." },
        { type: "input", title: "What opposite action will you try?", content: "Write one small thing you'll do that's the opposite of numbing out." },
      ],
    },
    {
      id: "emotion_checkin",
      title: "Emotion Wheel Check-In",
      description: "Recognize subtle feelings beneath the surface",
      duration: "5 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Numbness often hides more specific feelings", content: "Underneath 'I feel nothing' is usually something more specific." },
        { type: "choice", title: "If you dig a little deeper, you might feel...", content: "What resonates?", choices: ["Tired and disappointed", "Quietly sad", "Frustrated but hopeless", "Overwhelmed and shut down"] },
        { type: "input", title: "Say more about that feeling", content: "Write anything that comes up when you sit with that feeling." },
        { type: "text", title: "You felt something. That matters.", content: "The fact you're here, exploring this, shows you haven't given up on yourself." },
      ],
    },
  ],
  fear_of_failure: [
    {
      id: "evidence_check",
      title: "Evidence Check",
      description: "Challenge the thought that you'll fail",
      duration: "6 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Your fear of failure is a thought, not a fact", content: "CBT helps us examine evidence for and against our fears." },
        { type: "input", title: "What are you afraid of failing at?", content: "Be specific. What's the fear?" },
        { type: "input", title: "Evidence FOR failure", content: "What makes you think you'll fail? List what comes to mind." },
        { type: "input", title: "Evidence AGAINST failure", content: "What has worked before? What strengths do you have? What have you overcome?" },
        { type: "text", title: "The case against failure is stronger", content: "Most of the time, when we list both sides, our strengths outweigh our fears." },
      ],
    },
    {
      id: "success_log",
      title: "Success Log",
      description: "Remind yourself what you've already achieved",
      duration: "5 min",
      type: "journaling",
      steps: [
        { type: "text", title: "We forget our wins faster than our losses", content: "Your brain is wired to focus on negatives. Let's balance the ledger." },
        { type: "input", title: "3 things you've done well recently", content: "Anything counts — big or small. A kind act, finishing something, showing up." },
        { type: "input", title: "A challenge you've overcome", content: "Something you got through that felt impossible at the time." },
        { type: "text", title: "You have a track record of getting through things", content: "Whatever comes next, you have evidence that you can handle it." },
      ],
    },
  ],
  low_self_esteem: [
    {
      id: "mirror_affirmation",
      title: "Mirror Affirmation + Proof",
      description: "Build real self-belief with evidence",
      duration: "5 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Affirmations only work with evidence", content: "Empty affirmations feel hollow. Let's attach them to real things you've done or are." },
        { type: "input", title: "One thing you genuinely like about yourself", content: "It can be a trait, a habit, a skill — anything real." },
        { type: "input", title: "Why is that true? Give proof.", content: "What evidence supports this?" },
        { type: "text", title: "That's a real strength", content: "You're not making it up. You just proved it. This is yours to keep." },
      ],
    },
  ],
  peer_pressure: [
    {
      id: "values_check",
      title: "Values Clarification",
      description: "Reconnect with what actually matters to you",
      duration: "7 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Pressure loses power when your values are clear", content: "When you know what you stand for, it's easier to say no to what you don't." },
        { type: "choice", title: "What matters most to you?", content: "Pick what resonates:", choices: ["Honesty and integrity", "Kindness and loyalty", "Achievement and growth", "Peace and balance"] },
        { type: "input", title: "A time you acted against your values", content: "When did you do something that didn't feel like you? What happened?" },
        { type: "input", title: "What would 'you at your best' do?", content: "In the situation you're facing, what would the version of you who is fully themselves choose?" },
      ],
    },
  ],
  relationship_issues: [
    {
      id: "letter_unsent",
      title: "Unsent Letter",
      description: "Say what you haven't been able to say",
      duration: "8 min",
      type: "journaling",
      steps: [
        { type: "text", title: "Some things need to be said, even unsent", content: "Writing to someone — without sending it — can release enormous pain." },
        { type: "input", title: "Who is this for?", content: "Who has hurt you, confused you, or left you with unanswered questions?" },
        { type: "input", title: "Write what you wish they knew", content: "What have you never been able to say? Say it here. Fully. Honestly." },
        { type: "text", title: "You said it. It's real.", content: "You don't need their validation to process your feelings. Your feelings were always valid." },
      ],
    },
  ],
  mood_swings: [
    {
      id: "mood_pattern",
      title: "Mood Pattern Tracker",
      description: "Spot what triggers your mood shifts",
      duration: "6 min",
      type: "reflection",
      steps: [
        { type: "text", title: "Mood swings often have patterns", content: "When we notice the triggers, we gain power over our reactions." },
        { type: "choice", title: "When do your moods shift most?", content: "Pick what's true:", choices: ["After social interactions", "When I'm tired or hungry", "During/after school or work", "When plans change suddenly"] },
        { type: "input", title: "Describe a recent mood shift", content: "What happened before it? During? After?" },
        { type: "text", title: "Pattern spotted is pattern managed", content: "Just noticing is a superpower. The more you observe, the less reactive you become." },
      ],
    },
  ],
};

export function getTopTasks(concern: string): Task[] {
  return taskDatabase[concern] || taskDatabase["anxiety"];
}

export function getAllTasks(): Task[] {
  return Object.values(taskDatabase).flat();
}

export function getTaskById(id: string): Task | undefined {
  return getAllTasks().find((t) => t.id === id);
}
