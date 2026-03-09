# Aroha — Mental Health Companion

A mobile-first mental health companion app built with Expo Router (React Native).

## Overview

Aroha is a Gen-Z focused emotional support app designed for teens and young adults. It provides self-guided mental health tools, mood tracking, and access to professional support resources. The app is built for emotional safety — non-clinical, supportive, and private.

## Tech Stack

- **Frontend**: Expo Router (React Native), TypeScript
- **State**: React Context + AsyncStorage (local persistence)
- **Fonts**: Poppins (headings) + Inter (body)
- **Backend**: Express.js (landing page + static hosting only)
- **Icons**: @expo/vector-icons (Feather, Ionicons)
- **Animation**: Animated API (breathing circles, transitions)

## Features

### Onboarding Flow
- 6-second breathing animation intro
- Minimalist text-based mood scale (Very Low → Good, 7 labels)
- Personal details (name, age, gender)
- India districts dropdown — searchable state + district selector (250+ districts)
- Concern selection grid (9 concerns from Problem Matrix)

### Home Screen
- Personalized greeting + streak/XP stats
- AI-style emotional insights (pattern-based, from mood/sleep/water/activity data)
- Today's logged mood chip (if logged)
- Recommended activity based on primary concern
- Additional tools for the feeling
- Quick access to diagnostic and professional help

### Untangle Page
- Emotion selector (8 feelings mapped to concerns)
- Concern chip filter (9 categories)
- CBT/DBT-backed therapeutic task engine (5 tasks per concern)
- Each task with multi-step interactive flow

### Diagnostic Page
- Hamilton Anxiety Rating Scale (HAM-A) — 14 questions
- Quick evaluation mode (4 questions)
- Psychic vs Somatic split analysis
- Gentle, non-clinical interpretation
- Results saved to growth tracker

### Tracking Page
- Water intake tracker (daily goal: 8 glasses)
- Sleep tracker (0.5h increments)
- Mood logger — text-based scale (Very Low → Good) with 7-day history
- BMI calculator
- To-do list
- Cycle tracker (female users only) — period logging, cycle prediction, phase-based support, symptom tracking with personalized tips

### MindKit Page
- Saved activities library
- Private journal (modal entry, full CRUD)
- Content library — 10 research-backed articles, exercises, lessons across 7 categories
- Growth snapshot (XP, streak, entries, saved tools)
- Level progress bar
- Wellbeing check history

### SOS Page (Global Floating Button)
- Emergency call buttons (112, iCall, nearest hospital)
- Guided breathing animation
- 5-4-3-2-1 grounding technique
- Youth helplines directory

### Professional Help Page
- Government hospitals list
- Youth helplines with call buttons
- Conversation starters
- District-aware resource display

### Activity Flow
- Step-by-step guided experiences
- Step types: text, breathing animation, text input, choice, visualization
- XP awarded on completion
- Save to MindKit option

## Data Storage

All data stored in AsyncStorage:
- `@aroha_profile` — user profile + onboarding state
- `@aroha_xp` — total XP
- `@aroha_streak` — daily streak
- `@aroha_journal` — journal entries
- `@aroha_saved` — saved activities
- `@aroha_water` — water tracker by date
- `@aroha_sleep` — sleep tracker by date
- `@aroha_todos` — to-do list
- `@aroha_diagnostic` — diagnostic results
- `@aroha_cycle` — menstrual cycle entries
- `@aroha_mood_history` — mood log history

## Design System

- Primary: #38BDF8 (sky blue)
- Accent: #A78BFA (purple)
- Accent Pink: #F472B6
- Success: #10B981
- Warning: #F59E0B
- Critical: #EF4444
- Dark background: #0F172A
- Light background: #F8FAFC

## Navigation Structure

```
app/
  index.tsx              # Redirects based on onboarding status
  onboarding.tsx         # Multi-step onboarding flow
  diagnostic.tsx         # HAM-A diagnostic
  sos.tsx                # Emergency SOS screen
  activity.tsx           # Step-by-step activity flow
  professional-help.tsx  # Professional resources
  (tabs)/
    _layout.tsx          # Tab bar (NativeTabs + fallback)
    home.tsx             # Home dashboard
    untangle.tsx         # Emotion + task engine
    tracking.tsx         # Health trackers
    mindkit.tsx          # Saved tools + journal + growth
```

## Libraries

- `expo-linear-gradient` — gradient backgrounds/cards
- `expo-haptics` — tactile feedback
- `expo-blur` — tab bar blur effect (iOS)
- `@react-native-async-storage/async-storage` — local persistence
- `react-native-reanimated` — animations
- `expo-glass-effect` — iOS 26 liquid glass tab bar
