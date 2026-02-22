# AI Learning Playground — V1 Implementation Plan

> **Status**: ✅ Approved — Locked on 2026-02-21
> **Scope**: V1 launch — ~30 modules, client-side only, Vercel deploy
> **Timeline**: ~8 weeks
> **Deep context**: See [brainstorm.md](file:///c:/Users/LOQ/source/repos/projects/ai_playground/docs/brainstorm.md) for full rationale behind every decision

---

## Table of Contents

1. [What We're Building](#what-were-building)
2. [Locked-In Technical Decisions](#locked-in-technical-decisions)
3. [Core TypeScript Interfaces](#core-typescript-interfaces)
4. [Component API Contracts](#component-api-contracts)
5. [Content Architecture](#content-architecture)
6. [UI Structure](#ui-structure)
7. [Design System — "Dark Glass Lab"](#design-system--dark-glass-lab)
8. [localStorage Schema](#localstorage-schema)
9. [File Structure](#file-structure)
10. [Reference Module — Vectors & Matrices](#reference-module--vectors--matrices)
11. [Build Order](#build-order)
12. [Verification Plan](#verification-plan)
13. [Brainstorm Cross-Reference Map](#brainstorm-cross-reference-map)

---

## What We're Building

An interactive, visual-first AI learning platform. Users learn by **seeing and manipulating** — not reading walls of text. Every concept has:

- An **interactive visualization** (the primary teaching tool)
- An **intuitive text explanation** (2-3 sentences, plain language)
- A **"Go Deeper" expandable** (formal math, KaTeX, paper references)
- Optional **quiz questions** and **author's notes**

Two audiences served on the same page: beginners read the intuitive text and interact with visuals; experienced learners expand "Go Deeper" for formal rigor.

**What this is NOT**: a video course, a textbook, or a passive experience. Every screen is interactive.

---

## Locked-In Technical Decisions

### Core Stack

| Layer     | Tool                             | Version | Notes                                                                                          |
| --------- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| Framework | **Next.js** (App Router)         | 15.x    | TypeScript, React 19                                                                           |
| Styling   | **Tailwind CSS** + custom CSS    | 4.x     | Tailwind for UI layout; custom CSS for viz containers, glassmorphism, and interactive controls |
| State     | **localStorage** + React Context | —       | No backend, no auth in V1                                                                      |
| Deploy    | **Vercel**                       | —       | Auto-deploy from Git, `main` branch                                                            |

### Visualization Stack (Tiered)

Each tier uses the most appropriate rendering tool. Do not use React Three Fiber for 2D math visualizations or Mafs for ML algorithm animations.

| Tier               | Primary Tool                 | Why                                                                                                                               |
| ------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Tier 0 (Math)      | **Mafs** + **KaTeX**         | Mafs is built for interactive math — coordinate grids, vectors, functions. KaTeX for equations everywhere                         |
| Tier 1-2 (ML)      | **Canvas 2D** + **Konva.js** | ML visuals need custom rendering (data points, decision boundaries, algorithm animations). Konva for interactive layered canvases |
| Tier 3+ (3D)       | **React Three Fiber**        | 3D loss landscapes, network architectures. Only use when 3D adds genuine value                                                    |
| Charts             | **Visx**                     | Loss curves, metric charts, distribution plots                                                                                    |
| UI animation       | **Framer Motion**            | Page transitions, component enter/exit, layout animations                                                                         |
| Sequence animation | **GSAP**                     | Step-through algorithm animations (forward pass, backprop flow). Timeline-based, our web-native Manim alternative                 |

### Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "mafs": "^0.19",
    "katex": "^0.16",
    "react-katex": "^3",
    "konva": "^9",
    "react-konva": "^18",
    "@react-three/fiber": "^8",
    "@react-three/drei": "^9",
    "@visx/visx": "^3",
    "framer-motion": "^11",
    "gsap": "^3",
    "fuse.js": "^7"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@types/react": "^19",
    "@types/katex": "^0.16",
    "eslint": "^9",
    "eslint-config-next": "^15"
  }
}
```

---

## Core TypeScript Interfaces

These are the **exact types** that the entire codebase builds on. All content files, components, and hooks reference these.

```ts
// src/types/curriculum.ts

/** A single tier in the curriculum (Tier 0, Tier 1, etc.) */
export interface Tier {
  id: number; // 0, 1, 2, 3, 4, 5
  title: string; // "Mathematical Foundations"
  emoji: string; // "🟢"
  color: string; // CSS color for tier theming
  description: string; // Short description for tier card
  unlockThreshold: number; // 0.7 = 70% of previous tier
  clusters: Cluster[]; // Grouped modules within this tier
}

/** A sub-group of modules within a tier */
export interface Cluster {
  id: string; // "linear-algebra"
  title: string; // "Linear Algebra"
  emoji: string; // "🧱"
  modules: Module[];
}

/** A single learning module (e.g., "Vectors & Matrices") */
export interface Module {
  id: string; // "vectors" (unique within tier)
  tierId: number; // 0
  clusterId: string; // "linear-algebra"
  title: string; // "Vectors & Matrices"
  description: string; // One-line description for cards
  tags: string[]; // ["linear-algebra", "geometry", "foundation"]
  prerequisites: string[]; // Module IDs: ["matrices"] or []
  difficulty: "beginner" | "intermediate" | "advanced" | "research";
  estimatedMinutes: number; // 20
  visualizationComponent: string; // "VectorTransform" — maps to component
  steps: Step[]; // Phase 1: Guided exploration steps
  playground: PlaygroundConfig; // Phase 2: Free playground
  challenges: Challenge[]; // Phase 3: Challenges
}

/** A single guided exploration step */
export interface Step {
  id: string; // "step-1"
  title: string; // "What is a Vector?"
  visualization: {
    component: string; // "VectorTransform"
    props: Record<string, any>; // Initial props for this step's viz state
  };
  content: {
    text: string; // Intuitive explanation (2-3 sentences, plain language)
    goDeeper?: GoDeeper; // Expandable formal content
    authorNote?: string; // Optional collapsible note
  };
  quiz?: Quiz; // Optional quiz for this step
  interactionHint?: string; // "Drag the vector to see how it changes"
}

/** Expandable "Go Deeper" formal content */
export interface GoDeeper {
  math?: string; // KaTeX string: "\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}"
  explanation: string; // Formal text explanation
  references?: Reference[]; // Paper/textbook references
}

export interface Reference {
  title: string; // "Linear Algebra and Its Applications"
  author: string; // "Gilbert Strang"
  url?: string; // Optional link
  year?: number;
}

/** Quiz question */
export interface Quiz {
  question: string; // "Which direction does the gradient point?"
  options: string[]; // ["Uphill", "Downhill", "Sideways", "Random"]
  correctIndex: number; // 0 (zero-indexed)
  explanation: string; // Shown after answering: "The gradient points uphill..."
}

/** Playground configuration */
export interface PlaygroundConfig {
  description: string; // "Explore vector operations freely"
  component: string; // Viz component to render in full mode
  parameters: PlaygroundParam[]; // Exposed parameters
  tryThis: string[]; // Prompt suggestions displayed on sidebar
}

export interface PlaygroundParam {
  id: string; // "magnitude"
  label: string; // "Vector Magnitude"
  type: "slider" | "stepper" | "toggle" | "select";
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean | string;
  options?: string[]; // For 'select' type
}

/** Challenge task */
export interface Challenge {
  id: string; // "challenge-1"
  title: string; // "Match the Target Vector"
  description: string; // "Transform the blue vector to match the red target"
  component: string; // Viz component configured for this challenge
  completionCriteria: {
    type: "threshold" | "exact" | "custom";
    target: number | string; // e.g., 0.01 for loss threshold
    metric: string; // "distance" | "loss" | "steps" | custom
  };
  hints?: string[]; // Progressive hints
  maxAttempts?: number; // Optional attempt limit
}
```

```ts
// src/types/progress.ts

/** Full persisted progress state */
export interface ProgressState {
  version: number; // Schema version for migrations
  lastUpdated: string; // ISO timestamp
  streak: StreakData;
  tiers: Record<number, TierProgress>; // keyed by tier ID
  badges: string[]; // Earned badge IDs
  activityLog: ActivityEntry[]; // For the calendar heatmap
  settings: UserSettings;
}

export interface StreakData {
  current: number; // Current streak count
  longest: number; // All-time longest
  lastActiveDate: string; // "2026-03-15" — to detect breaks
}

export interface TierProgress {
  unlocked: boolean;
  modules: Record<string, ModuleProgress>; // keyed by module ID
}

export interface ModuleProgress {
  status: "locked" | "available" | "in-progress" | "completed";
  stepsCompleted: string[]; // Step IDs completed
  quizAnswers: Record<string, number>; // stepId → selected option index
  challengesCompleted: string[]; // Challenge IDs completed
  playgroundVisited: boolean;
  lastAccessedStep: string; // For "continue where you left off"
  completedAt?: string; // ISO timestamp
}

export interface ActivityEntry {
  date: string; // "2026-03-15"
  modulesWorkedOn: string[]; // Module IDs touched that day
  stepsCompleted: number; // Count of steps completed
  minutesSpent: number; // Estimated from step count × avg time
}

export interface UserSettings {
  theme: "dark" | "light"; // Dark mode default, user-toggleable
  goDeeper: "collapsed" | "expanded"; // Global default for Go Deeper sections
  animationSpeed: "slow" | "normal" | "fast";
  sidebarCollapsed: boolean;
}
```

---

## Component API Contracts

### Core Lesson Components

```tsx
// StepViewer — The heart of the lesson engine
// Renders one guided step: visualization + text + GoDeeper + quiz
interface StepViewerProps {
  step: Step; // Current step data
  stepIndex: number; // 0-indexed position in module
  totalSteps: number; // Total steps in module
  onComplete: (stepId: string) => void; // Called when step is completed
  onNext: () => void; // Navigate to next step
  onPrevious: () => void; // Navigate to previous step
  isCompleted: boolean; // Whether this step was already completed
}
// Behavior:
// - Renders visualization component at top (60% height)
// - Text content below the visualization
// - "Go Deeper" section below text (collapsed by default)
// - Quiz below Go Deeper (if present)
// - Author's Note in collapsible callout (if present)
// - "Continue →" button at bottom (triggers onComplete + onNext)
// - Left/right arrow keyboard shortcuts for navigation
// - Step is marked complete when user clicks Continue or answers quiz correctly
```

```tsx
// GoDeeper — Expandable formal content section
interface GoDeeperProps {
  content: GoDeeper; // Math, explanation, references
  defaultExpanded?: boolean; // From user settings
}
// Behavior:
// - Collapsed by default (shows "▸ Go Deeper" trigger)
// - Smooth expand animation (Framer Motion, ~300ms)
// - Renders KaTeX math blocks
// - Shows references as linked citations at bottom
// - Remembers expand/collapse state per session (not persisted)
// - Subtle glass background to distinguish from main content
```

```tsx
// QuizBlock — Multiple choice with inline feedback
interface QuizBlockProps {
  quiz: Quiz;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  previousAnswer?: number; // Show previous selection if revisiting
}
// Behavior:
// - Radio-button style options
// - On selection: immediately show correct/incorrect feedback
// - Correct: green highlight + explanation
// - Incorrect: red highlight on selected + green on correct + explanation
// - Cannot change answer after submitting (but can view on revisit)
// - Does NOT block progression — wrong answers still allow "Continue"
```

```tsx
// AuthorNote — Collapsible margin note
interface AuthorNoteProps {
  content: string;
}
// Behavior:
// - Collapsed by default, shows "💡 Author's Note" trigger
// - Italic styling, slightly subdued text color
// - Conversational tone — the author's personal insight
```

```tsx
// ChallengeCard — Single challenge in Phase 3
interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  onComplete: (challengeId: string) => void;
}
// Behavior:
// - Shows challenge description + goal
// - Embeds visualization component configured for this challenge
// - Real-time progress indicator (e.g., "Loss: 0.34 → Target: < 0.01")
// - ✅ checkmark animation on completion
// - "Show Hint" button reveals progressive hints
```

### Control Components

```tsx
// ParamSlider — Reusable parameter slider for visualizations
interface ParamSliderProps {
  label: string; // "Learning Rate"
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string; // "α", "ε", "%"
  showValue?: boolean; // Display current value (default: true)
  color?: string; // Accent color for the track fill
}
// Style: Glass background, gradient-filled track, circular thumb
// The slider must be responsive — no fixed width
```

```tsx
// ParamStepper — Discrete value stepper (for integers, small ranges)
interface ParamStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number; // Usually 1
  onChange: (value: number) => void;
}
// Style: [-] value [+] with glass buttons
```

```tsx
// ParamToggle — Boolean toggle
interface ParamToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}
// Style: Pill-shaped toggle, accent glow when on
```

### UI Components

```tsx
// Card — Clean container (used everywhere, Brilliant-inspired)
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "interactive";
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
}
// Variants:
//   default:     bg-surface, border-subtle, shadow-sm
//   elevated:    bg-elevated, shadow-md
//   interactive: default + hover:translateY(-2px) + shadow-md + cursor-pointer
```

```tsx
// ProgressBar — Gradient-filled progress indicator
interface ProgressBarProps {
  value: number; // 0-1
  label?: string; // "Tier 0 Progress"
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg"; // Height: 4px, 8px, 12px
  gradient?: [string, string]; // Custom gradient colors, default: accent indigo→violet
}

// TierCard — Dashboard tile for each tier
interface TierCardProps {
  tier: Tier;
  progress: TierProgress;
  isUnlocked: boolean;
  onClick: () => void; // Navigate to tier page
}
// Behavior:
// - Colored top stripe using tier's accent color (--tier-N)
// - Shows tier emoji, title, module count, progress bar
// - Locked state: grayscale, lock icon overlay, "Complete 70% of Tier N to unlock"
// - Unlocked: full color, hover lift effect, tier-colored progress bar
// - Completed: gold border, completion badge
```

### Layout Components

```tsx
// Sidebar — Lesson step sidebar (only visible during lessons)
interface SidebarProps {
  module: Module;
  currentStepIndex: number;
  completedSteps: string[];
  onStepClick: (index: number) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}
// Behavior:
// - Lists all steps as clickable items
// - Current step highlighted with accent color
// - Completed steps show ✅ checkmark
// - Collapsible to icon-only mode
// - Shows module title, current phase, and progress at top

// TopNav — Global top navigation
interface TopNavProps {
  currentPath: string; // For breadcrumb/active indicator
}
// Contents: Logo (left), Breadcrumb (center), Streak counter + ThemeToggle + Profile link (right)
```

---

## Content Architecture

### Module-as-Package

Every module is a self-contained folder. Adding a module = adding a folder, zero core code changes.

```
content/
├── curriculum.ts              # Master curriculum: tier definitions, cluster groupings
├── tier0/
│   ├── vectors/
│   │   ├── config.ts          # Module metadata (title, tags, prerequisites, etc.)
│   │   ├── steps.ts           # Guided step definitions (array of Step objects)
│   │   ├── playground.ts      # PlaygroundConfig
│   │   ├── challenges.ts      # Challenge[] definitions
│   │   └── deeper.ts          # GoDeeper content, keyed by step ID
│   ├── matrices/
│   │   ├── config.ts
│   │   ├── steps.ts
│   │   └── ...
│   └── ...
├── tier1/
│   └── ...
└── tier2/
    └── ...
```

### Content Registry

```ts
// src/lib/contentRegistry.ts
// Build-time discovery — scans content/ folders, exports typed curriculum data

import { Tier, Module, Cluster } from '@/types/curriculum';

export function getCurriculum(): Tier[] { ... }
export function getTier(tierId: number): Tier { ... }
export function getModule(tierId: number, moduleId: string): Module { ... }
export function getModulesByTag(tag: string): Module[] { ... }
export function getModulesByCluster(clusterId: string): Module[] { ... }
export function getPrerequisites(module: Module): Module[] { ... }
export function getRelatedModules(module: Module, limit?: number): Module[] { ... }
```

### Lesson Format (3-Phase + Go Deeper)

```
Phase 1: GUIDED EXPLORATION (8-15 steps)
  Each step:
    ┌──────────────────────────────────────┐
    │   [Interactive Visualization]        │  ← 60% of viewport height
    ├──────────────────────────────────────┤
    │   "Intuitive explanation."           │  ← 2-3 sentences, plain language
    │                                      │
    │   ▸ Go Deeper              (expand)  │  ← KaTeX math, formal defs, paper refs
    │   💡 Author's Note         (expand)  │  ← Personal insight, optional
    │   ○ Quiz question          (inline)  │  ← Multiple choice, optional
    │                                      │
    │              [Continue →]            │
    └──────────────────────────────────────┘

Phase 2: FREE PLAYGROUND
  Full visualization, all parameters exposed via ParamSliders
  "Try This" prompts on the side panel

Phase 3: CHALLENGE (2-4 tasks)
  Measurable goals (e.g., "converge in <20 steps", "match the target vector")
  Completion detection triggers ✅ animation
```

### V1 Content Scope

| Tier                     | Modules | Status   |
| ------------------------ | ------- | -------- |
| Tier 0: Math Foundations | 13      | Complete |
| Tier 1: ML Fundamentals  | 12      | Complete |
| Tier 2: Classical ML     | 5-6     | Started  |
| **Total**                | **~30** |          |

Full curriculum with all 82 modules defined in [brainstorm.md §2](file:///c:/Users/LOQ/source/repos/projects/ai_playground/docs/brainstorm.md).

---

## UI Structure

### Pages & Routes

| Route                                  | Page                 | Key Components                                                    |
| -------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `/`                                    | Dashboard            | TierCard × 6, StreakCounter, ActivityCalendar                     |
| `/roadmap`                             | Journey map          | Visual node graph of module connections                           |
| `/profile`                             | User stats           | StreakCounter, ActivityCalendar, BadgeGrid, tier progress summary |
| `/tier/[tierId]`                       | Tier overview        | Module list (or cluster view), tier progress bar                  |
| `/tier/[tierId]/[moduleId]`            | Module entry         | Redirects to `/guided?step=1` or last accessed step               |
| `/tier/[tierId]/[moduleId]/guided`     | Guided (Phase 1)     | StepViewer, Sidebar (step list), GoDeeper, QuizBlock              |
| `/tier/[tierId]/[moduleId]/playground` | Playground (Phase 2) | Full viz + ParamSliders + "Try This" panel                        |
| `/tier/[tierId]/[moduleId]/challenge`  | Challenges (Phase 3) | ChallengeCard list, completion tracking                           |

### Gamification (Light)

| Feature                  | Implementation                                                               |
| ------------------------ | ---------------------------------------------------------------------------- |
| ✅ Completion checkmarks | Step, module, tier level — stored in `ModuleProgress`                        |
| 📊 Progress bars         | Per tier, gradient-filled (`ProgressBar` component)                          |
| 🔥 Streak counter        | `useStreak` hook — daily tracking, reset at midnight local time              |
| 📅 Activity calendar     | GitHub-style heatmap from `activityLog` in `ProgressState`                   |
| 🏅 Milestone badges      | Predefined list: "Tier 0 Complete", "10-Day Streak", "First Challenge", etc. |
| 🔒 Tier gating           | `unlockThreshold: 0.7` — 70% of previous tier's modules must be completed    |

---

## Design System — Brilliant-Inspired, Dual Theme

> **Inspiration**: Brilliant.org's clean, colorful, approachable visual language — vibrant per-topic colors, clean layouts, generous whitespace, playful yet professional. We support **both dark (default) and light modes** with a UI toggle.

### Theme Toggle

A `ThemeToggle` component in the TopNav lets users switch between dark and light mode. Theme preference is persisted in `UserSettings.theme`. The toggle uses `data-theme` attribute on `<html>` to switch CSS variable sets.

```tsx
// src/components/ui/ThemeToggle.tsx
interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}
// Behavior: Sun/moon icon pill toggle. Smooth transition when switching.
// On first visit: defaults to 'dark'. Persisted in localStorage settings.
```

### Colors — Dark Mode (Default)

```css
[data-theme="dark"] {
  /* Base */
  --bg-primary: #0f1117; /* Deep dark, slightly warmer than pure black */
  --bg-surface: #1a1d27; /* Card/panel backgrounds */
  --bg-elevated: #242836; /* Elevated panels, modals */
  --bg-hover: #2a2e3d; /* Hover states on surfaces */

  /* Borders & dividers */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Text */
  --text-primary: #f0f0f5; /* Headings, important text */
  --text-secondary: #a0a0b8; /* Body text, descriptions */
  --text-muted: #636380; /* Captions, hints */

  /* Accent (consistent across themes) */
  --accent: #6366f1; /* Primary interactive color */
  --accent-hover: #818cf8;
  --accent-soft: rgba(99, 102, 241, 0.15); /* Accent backgrounds */

  /* Semantic */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

### Colors — Light Mode

```css
[data-theme="light"] {
  /* Base — clean whites like Brilliant */
  --bg-primary: #ffffff;
  --bg-surface: #f8f9fb; /* Subtle off-white for cards */
  --bg-elevated: #ffffff; /* Elevated = pure white + shadow */
  --bg-hover: #f0f1f5;

  /* Borders & dividers */
  --border-subtle: rgba(0, 0, 0, 0.04);
  --border-default: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.15);

  /* Text */
  --text-primary: #1a1a2e; /* Near-black for headings */
  --text-secondary: #4a4a6a; /* Dark gray for body */
  --text-muted: #8a8aa0; /* Light gray for captions */

  /* Accent (same hue, adjusted for light bg) */
  --accent: #4f46e5;
  --accent-hover: #6366f1;
  --accent-soft: rgba(79, 70, 229, 0.08);

  /* Semantic */
  --color-success: #059669;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* Shadows — more prominent in light mode */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### Per-Tier Color Identity

Each tier has its own vibrant color personality — used for tier cards, progress bars, active module headers, and viz accent colors. These remain the same across both themes.

```css
:root {
  /* Tier accent colors — vibrant Brilliant-style palette */
  --tier-0: #10b981; /* Emerald green — Math Foundations */
  --tier-0-soft: rgba(16, 185, 129, 0.12);
  --tier-0-bg: #ecfdf5; /* Light mode tier card bg */
  --tier-0-bg-dark: #0d2818; /* Dark mode tier card bg */

  --tier-1: #3b82f6; /* Blue — ML Fundamentals */
  --tier-1-soft: rgba(59, 130, 246, 0.12);
  --tier-1-bg: #eff6ff;
  --tier-1-bg-dark: #0c1a2e;

  --tier-2: #8b5cf6; /* Violet — Classical ML */
  --tier-2-soft: rgba(139, 92, 246, 0.12);
  --tier-2-bg: #f5f3ff;
  --tier-2-bg-dark: #1a0e2e;

  --tier-3: #f59e0b; /* Amber — Deep Learning */
  --tier-3-soft: rgba(245, 158, 11, 0.12);
  --tier-3-bg: #fffbeb;
  --tier-3-bg-dark: #2e1f08;

  --tier-4: #ef4444; /* Red — Modern AI */
  --tier-4-soft: rgba(239, 68, 68, 0.12);
  --tier-4-bg: #fef2f2;
  --tier-4-bg-dark: #2e0c0c;

  --tier-5: #6366f1; /* Indigo — Research Frontier */
  --tier-5-soft: rgba(99, 102, 241, 0.12);
  --tier-5-bg: #eef2ff;
  --tier-5-bg-dark: #0e0e2e;

  /* Sizing (shared across themes) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px; /* Brilliant uses generous rounding */
  --sidebar-width: 280px;
  --sidebar-collapsed: 64px;
  --topnav-height: 64px;
}
```

### Typography

```css
/* Fonts: loaded via next/font in layout.tsx */
--font-heading: 'Plus Jakarta Sans', sans-serif;  /* Bold, friendly — tier cards, page titles */
--font-body:    'Inter', sans-serif;               /* Clean reading — explanations, UI */
--font-math:    KaTeX default (Computer Modern);   /* Rendered by KaTeX, no manual styling */

/* Scale */
h1: 2rem/2.5rem, font-heading, weight 700
h2: 1.5rem/2rem, font-heading, weight 600
h3: 1.25rem/1.75rem, font-heading, weight 600
body: 1rem/1.5rem, font-body, weight 400
small: 0.875rem/1.25rem, font-body, weight 400
caption: 0.75rem/1rem, font-body, weight 400, text-muted
```

### Card Styles (Brilliant-inspired)

Cards use **clean surfaces + shadows** in light mode and **subtle borders** in dark mode. No heavy glassmorphism — keep it clean and approachable.

```css
/* Clean card — primary container throughout the app */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.card--interactive:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px); /* Subtle lift on hover — Brilliant-style */
  border-color: var(--border-default);
}

/* Tier card — colored accent along top or left border */
.tier-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  border-top: 3px solid var(--tier-color); /* Colored top stripe */
  box-shadow: var(--shadow-sm);
}

.tier-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Viz container — where interactive visualizations live */
.viz-container {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
```

### Layout Blueprint

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]     Breadcrumb: Tier 0 > Vectors > Step 3   🔥7 [☀/🌙]│  ← TopNav (64px) + theme toggle
├────────┬────────────────────────────────────────────────────────┤
│        │                                                        │
│  Step  │        [INTERACTIVE VISUALIZATION]                     │  ← 60% height, viz-container
│  List  │                                                        │
│        ├────────────────────────────────────────────────────────┤
│  1 ✅  │                                                        │
│  2 ✅  │  "Intuitive explanation in plain language."            │
│  3 ●   │                                                        │
│  4 ○   │  ▸ Go Deeper                                          │
│  5 ○   │  💡 Author's Note                                     │
│  ...   │  ○ Quiz question                                      │
│        │                                                        │
│ [≡]    │                    [← Previous]  [Continue →]          │
│ 280px  │                                                        │
├────────┴────────────────────────────────────────────────────────┤
│  ── progress bar (tier-colored) ──────────── 3/12 steps ──     │
└─────────────────────────────────────────────────────────────────┘
```

---

## localStorage Schema

Everything is stored under a single key. The `version` field enables schema migrations.

```ts
// Key: "ai-playground-progress"
// Value: JSON.stringify(ProgressState)

// Default initial state (first visit):
const DEFAULT_PROGRESS: ProgressState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: "",
  },
  tiers: {
    0: { unlocked: true, modules: {} },
    1: { unlocked: false, modules: {} },
    2: { unlocked: false, modules: {} },
    3: { unlocked: false, modules: {} },
    4: { unlocked: false, modules: {} },
    5: { unlocked: false, modules: {} },
  },
  badges: [],
  activityLog: [],
  settings: {
    theme: "dark",
    goDeeper: "collapsed",
    animationSpeed: "normal",
    sidebarCollapsed: false,
  },
};
```

### Hooks for state access

```ts
// src/hooks/useProgress.ts
export function useProgress() {
  // Reads from localStorage, provides reactive state via Context
  return {
    progress: ProgressState;
    completeStep: (tierId: number, moduleId: string, stepId: string) => void;
    completeChallenge: (tierId: number, moduleId: string, challengeId: string) => void;
    getModuleProgress: (tierId: number, moduleId: string) => ModuleProgress;
    getTierCompletion: (tierId: number) => number;  // 0-1
    isTierUnlocked: (tierId: number) => boolean;
    resetProgress: () => void;
  };
}

// src/hooks/useStreak.ts
export function useStreak() {
  return {
    current: number;
    longest: number;
    recordActivity: () => void;    // Call on any learning interaction
    // Streak logic: if lastActiveDate === today → no change
    //               if lastActiveDate === yesterday → current++
    //               if lastActiveDate < yesterday → current = 1
  };
}

// src/hooks/useLesson.ts
export function useLesson(tierId: number, moduleId: string) {
  return {
    module: Module;
    currentStepIndex: number;
    setCurrentStep: (index: number) => void;
    currentStep: Step;
    isStepCompleted: (stepId: string) => boolean;
    completeCurrentStep: () => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    progress: { completed: number; total: number };
  };
}
```

---

## File Structure

```
ai-playground/
├── public/
│   ├── fonts/                         # Plus Jakarta Sans, Inter (self-hosted)
│   └── images/                        # OG images, badges, tier icons
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (fonts, theme, Context providers)
│   │   ├── page.tsx                   # Dashboard — TierCards, StreakCounter
│   │   ├── globals.css                # CSS variables, glassmorphism utilities
│   │   ├── roadmap/
│   │   │   └── page.tsx               # Journey map
│   │   ├── profile/
│   │   │   └── page.tsx               # Stats, calendar, badges
│   │   └── tier/
│   │       └── [tierId]/
│   │           ├── page.tsx           # Tier overview (module list)
│   │           └── [moduleId]/
│   │               ├── page.tsx       # Module entry (redirects to guided)
│   │               ├── guided/
│   │               │   └── page.tsx   # Phase 1: StepViewer + Sidebar
│   │               ├── playground/
│   │               │   └── page.tsx   # Phase 2: Full viz + controls
│   │               └── challenge/
│   │                   └── page.tsx   # Phase 3: ChallengeCards
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Lesson step sidebar
│   │   │   ├── TopNav.tsx             # Global top nav with breadcrumbs
│   │   │   └── Footer.tsx
│   │   ├── lesson/
│   │   │   ├── StepViewer.tsx         # Core: renders viz + text + GoDeeper + quiz
│   │   │   ├── GoDeeper.tsx           # Expandable formal content
│   │   │   ├── QuizBlock.tsx          # Multiple choice with feedback
│   │   │   ├── AuthorNote.tsx         # Collapsible margin note
│   │   │   └── ChallengeCard.tsx      # Challenge UI with completion detection
│   │   ├── dashboard/
│   │   │   ├── TierCard.tsx           # Tier overview card on dashboard
│   │   │   ├── StreakCounter.tsx       # Fire emoji + streak count
│   │   │   └── ActivityCalendar.tsx   # GitHub-style heatmap
│   │   ├── controls/
│   │   │   ├── ParamSlider.tsx        # Continuous parameter slider
│   │   │   ├── ParamStepper.tsx       # Discrete [-] value [+]
│   │   │   └── ParamToggle.tsx        # Boolean toggle
│   │   └── ui/
│   │       ├── Card.tsx                # Clean container (replaces GlassCard)
│   │       ├── ThemeToggle.tsx         # Dark/light mode toggle
│   │       ├── ProgressBar.tsx        # Gradient-filled bar
│   │       ├── Badge.tsx              # Achievement badge
│   │       └── Button.tsx             # Primary/secondary/ghost variants
│   │
│   ├── visualizations/                # Interactive visualization components
│   │   ├── shared/
│   │   │   ├── CanvasWrapper.tsx      # Base canvas with responsive resize
│   │   │   ├── KonvaStage.tsx         # Base Konva stage wrapper
│   │   │   └── colors.ts             # Viz-specific color palette
│   │   ├── tier0/
│   │   │   ├── VectorTransform.tsx    # Mafs: drag vectors in 2D
│   │   │   ├── MatrixMultiply.tsx     # Canvas: step-through multiplication
│   │   │   ├── LinearTransform.tsx    # Mafs: apply transforms to shapes
│   │   │   ├── EigenVisualizer.tsx    # Mafs: eigenvector highlighting
│   │   │   ├── NormsDistance.tsx       # Canvas: L1/L2/cosine on point clouds
│   │   │   ├── GradientField.tsx      # Mafs: tangent line slider
│   │   │   ├── PartialDerivatives.tsx # R3F: 3D surface with gradient arrows
│   │   │   ├── ChainRuleGraph.tsx     # Canvas: computation graph animation
│   │   │   ├── ConvexityDemo.tsx      # Mafs: convex vs non-convex surfaces
│   │   │   ├── ProbabilityVenn.tsx     # Canvas: interactive Venn/Bayes
│   │   │   ├── DistributionPlayground.tsx # Canvas: Gaussian with sliders
│   │   │   ├── EntropyVisualizer.tsx  # Canvas: entropy/KL divergence
│   │   │   └── StatisticsDemo.tsx     # Canvas: CLT, sampling
│   │   ├── tier1/
│   │   │   ├── MLPipeline.tsx         # Canvas: data → model → prediction
│   │   │   ├── SupervisedVsUnsupervised.tsx # Canvas: side-by-side
│   │   │   ├── FeatureScaling.tsx     # Canvas: normalized vs raw
│   │   │   ├── LinearRegressionFit.tsx # Konva: drag points, fit line
│   │   │   ├── GradientDescentBall.tsx # Canvas: ball on loss surface
│   │   │   ├── GDVariants.tsx         # Canvas: SGD vs Batch vs Mini-batch
│   │   │   ├── LogisticRegression.tsx # Canvas: sigmoid + boundary
│   │   │   ├── LossFunctions.tsx      # Visx: MSE vs cross-entropy vs hinge
│   │   │   ├── OverfittingDemo.tsx    # Visx: train vs test curves
│   │   │   ├── BiasVarianceDemo.tsx   # Canvas: complexity slider
│   │   │   ├── ConfusionMatrix.tsx    # Canvas: interactive confusion matrix
│   │   │   └── CrossValidation.tsx    # Canvas: fold splitting animation
│   │   └── tier2/                     # Built during weeks 5-6+
│   │
│   ├── content/                       # Module definitions (pure data)
│   │   ├── curriculum.ts              # Master curriculum structure
│   │   ├── tier0/
│   │   │   ├── vectors/               # See module-as-package pattern above
│   │   │   ├── matrices/
│   │   │   ├── linear-transforms/
│   │   │   ├── eigenvalues/
│   │   │   ├── norms/
│   │   │   ├── derivatives/
│   │   │   ├── partial-derivatives/
│   │   │   ├── chain-rule/
│   │   │   ├── optimization-basics/
│   │   │   ├── probability/
│   │   │   ├── distributions/
│   │   │   ├── information-theory/
│   │   │   └── statistics/
│   │   ├── tier1/
│   │   │   ├── what-is-ml/
│   │   │   ├── supervised-vs-unsupervised/
│   │   │   ├── feature-scaling/
│   │   │   ├── linear-regression/
│   │   │   ├── gradient-descent/
│   │   │   ├── gd-variants/
│   │   │   ├── logistic-regression/
│   │   │   ├── loss-functions/
│   │   │   ├── overfitting/
│   │   │   ├── bias-variance/
│   │   │   ├── evaluation-metrics/
│   │   │   └── cross-validation/
│   │   └── tier2/
│   │
│   ├── hooks/
│   │   ├── useProgress.ts             # localStorage progress CRUD
│   │   ├── useStreak.ts               # Daily streak logic
│   │   └── useLesson.ts              # Current lesson state machine
│   │
│   ├── lib/
│   │   ├── contentRegistry.ts         # Build-time content discovery
│   │   ├── progress.ts                # Progress calculation utilities
│   │   └── math.ts                    # Shared math utilities for visuals
│   │
│   └── types/
│       ├── curriculum.ts              # Tier, Cluster, Module, Step, Quiz, Challenge
│       ├── progress.ts                # ProgressState, ModuleProgress, etc.
│       └── visualization.ts           # Shared viz prop types
│
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Reference Module — Vectors & Matrices

This is the **gold standard** example of a fully specified module. All other modules should follow this pattern.

### config.ts

```ts
export const moduleConfig = {
  id: "vectors",
  tierId: 0,
  clusterId: "linear-algebra",
  title: "Vectors & Matrices",
  description:
    "See what vectors really are — drag them, transform them, build intuition.",
  tags: ["linear-algebra", "geometry", "foundation"],
  prerequisites: [],
  difficulty: "beginner" as const,
  estimatedMinutes: 20,
  visualizationComponent: "VectorTransform",
};
```

### steps.ts (first 4 steps shown)

```ts
import { Step } from "@/types/curriculum";

export const steps: Step[] = [
  {
    id: "step-1",
    title: "What is a Vector?",
    visualization: {
      component: "VectorTransform",
      props: {
        showGrid: true,
        vectors: [{ x: 3, y: 2, color: "accent", draggable: false }],
      },
    },
    content: {
      text: "A vector is just an arrow with a direction and a length. This one points to (3, 2) — three steps right and two steps up.",
      goDeeper: {
        math: "\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix} \\in \\mathbb{R}^2",
        explanation:
          "Formally, a vector in ℝ² is an ordered pair of real numbers. It represents both a point in space and a displacement from the origin. Vectors are the fundamental building blocks of linear algebra.",
        references: [
          {
            title: "Essence of Linear Algebra",
            author: "3Blue1Brown",
            url: "https://www.3blue1brown.com/topics/linear-algebra",
            year: 2016,
          },
        ],
      },
    },
    interactionHint: "Observe the vector on the grid.",
  },
  {
    id: "step-2",
    title: "Drag to Explore",
    visualization: {
      component: "VectorTransform",
      props: {
        showGrid: true,
        vectors: [{ x: 3, y: 2, color: "accent", draggable: true }],
        showCoordinates: true,
      },
    },
    content: {
      text: "Now drag the tip of the arrow. Watch how the coordinates change as you move it. The x-value changes when you go left/right, the y-value when you go up/down.",
      goDeeper: {
        math: "\\vec{v} = \\begin{bmatrix} v_x \\\\ v_y \\end{bmatrix}, \\quad ||\\vec{v}|| = \\sqrt{v_x^2 + v_y^2}",
        explanation:
          "The magnitude (length) of a vector is computed using the Pythagorean theorem. This extends naturally to higher dimensions: ||v|| = √(v₁² + v₂² + ... + vₙ²).",
      },
      authorNote:
        "This is the moment it clicks — vectors aren't abstract math, they're just arrows you can grab and move.",
    },
    interactionHint: "Drag the vector tip to change its coordinates.",
  },
  {
    id: "step-3",
    title: "Adding Vectors",
    visualization: {
      component: "VectorTransform",
      props: {
        showGrid: true,
        vectors: [
          { x: 2, y: 1, color: "blue", draggable: true, label: "a" },
          { x: 1, y: 2, color: "green", draggable: true, label: "b" },
        ],
        showSum: true,
        sumColor: "accent",
      },
    },
    content: {
      text: "Two vectors add up tip-to-tail. Drag either arrow and watch the purple result vector change.",
      goDeeper: {
        math: "\\vec{a} + \\vec{b} = \\begin{bmatrix} a_x + b_x \\\\ a_y + b_y \\end{bmatrix}",
        explanation:
          "Vector addition is component-wise. Geometrically, place the tail of b at the tip of a — the sum goes from the tail of a to the tip of b. This is commutative: a + b = b + a.",
      },
    },
    quiz: {
      question: "If a = (2, 1) and b = (1, 3), what is a + b?",
      options: ["(3, 4)", "(2, 3)", "(1, 2)", "(3, 3)"],
      correctIndex: 0,
      explanation: "Add component-wise: (2+1, 1+3) = (3, 4).",
    },
    interactionHint: "Drag either vector to see how the sum changes.",
  },
  {
    id: "step-4",
    title: "Scalar Multiplication",
    visualization: {
      component: "VectorTransform",
      props: {
        showGrid: true,
        vectors: [{ x: 2, y: 1, color: "accent", draggable: false }],
        scalarSlider: { min: -3, max: 3, step: 0.1, default: 1 },
      },
    },
    content: {
      text: "Multiplying a vector by a number (scalar) stretches or shrinks it. Drag the slider. What happens when the scalar is negative?",
      goDeeper: {
        math: "c \\cdot \\vec{v} = c \\begin{bmatrix} v_x \\\\ v_y \\end{bmatrix} = \\begin{bmatrix} c \\cdot v_x \\\\ c \\cdot v_y \\end{bmatrix}",
        explanation:
          "Scalar multiplication scales each component. When c > 1, the vector stretches. When 0 < c < 1, it shrinks. When c < 0, it flips direction. When c = 0, you get the zero vector.",
      },
    },
    quiz: {
      question: "What happens when you multiply a vector by -1?",
      options: [
        "It doubles in length",
        "It flips direction",
        "It becomes zero",
        "Nothing changes",
      ],
      correctIndex: 1,
      explanation:
        "Multiplying by -1 negates each component, which reverses the vector's direction while keeping its magnitude the same.",
    },
    interactionHint: "Drag the scalar slider — try negative values!",
  },
  // ... more steps: dot product, linear combinations, basis vectors, etc.
];
```

### playground.ts

```ts
import { PlaygroundConfig } from "@/types/curriculum";

export const playground: PlaygroundConfig = {
  description:
    "Experiment with vectors freely. Add, scale, and transform vectors on an infinite grid.",
  component: "VectorTransform",
  parameters: [
    {
      id: "vectorCount",
      label: "Number of Vectors",
      type: "stepper",
      min: 1,
      max: 5,
      step: 1,
      default: 2,
    },
    { id: "showSum", label: "Show Sum", type: "toggle", default: true },
    {
      id: "scalar",
      label: "Scalar Multiplier",
      type: "slider",
      min: -3,
      max: 3,
      step: 0.1,
      default: 1,
    },
    { id: "gridSnap", label: "Snap to Grid", type: "toggle", default: false },
  ],
  tryThis: [
    "Create two vectors that add up to the zero vector (0, 0)",
    "Find a scalar that makes a vector exactly 5 units long",
    "Make three vectors that form a triangle tip-to-tail",
    "Can you create two vectors where a + b = b + a visually?",
  ],
};
```

### challenges.ts

```ts
import { Challenge } from "@/types/curriculum";

export const challenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Match the Target",
    description:
      "Use vector addition to reach the red target point. You can only drag vectors a and b.",
    component: "VectorTransform",
    completionCriteria: {
      type: "threshold",
      target: 0.3,
      metric: "distance", // distance between sum vector tip and target point
    },
    hints: [
      "The target is at (4, 3). What two vectors add up to (4, 3)?",
      "Try a = (2, 1) and b = (2, 2). Close?",
    ],
  },
  {
    id: "challenge-2",
    title: "Scalar Puzzle",
    description:
      "Find the scalar that makes the blue vector land exactly on the green target.",
    component: "VectorTransform",
    completionCriteria: {
      type: "threshold",
      target: 0.1,
      metric: "distance",
    },
    hints: [
      "The target is at (4, 6) and the base vector is (2, 3). What scalar works?",
    ],
  },
  {
    id: "challenge-3",
    title: "Perpendicular Vectors",
    description: "Drag vector b so it's perpendicular (at 90°) to vector a.",
    component: "VectorTransform",
    completionCriteria: {
      type: "threshold",
      target: 0.05,
      metric: "dot-product", // |a · b| < 0.05 means ~perpendicular
    },
    hints: [
      "Two vectors are perpendicular when their dot product equals zero.",
      "If a = (2, 1), try b = (-1, 2). What's the dot product?",
    ],
  },
];
```

---

## Build Order

### Week 1: Foundation

| #   | Deliverable    | Details                                                                                    |
| --- | -------------- | ------------------------------------------------------------------------------------------ |
| 1   | Project init   | `npx create-next-app@latest ./ --typescript --tailwind --app --eslint --src-dir`           |
| 2   | Design system  | `globals.css` with dual-theme CSS variables (`data-theme`), card utilities                 |
| 3   | Font loading   | Plus Jakarta Sans + Inter via `next/font/google` in `layout.tsx`                           |
| 4   | Core UI        | `Card`, `ThemeToggle`, `ProgressBar`, `Button`, `Badge` components                         |
| 5   | Layout shell   | `TopNav` (logo, breadcrumb, streak, theme toggle), `Sidebar` (collapsible), `Footer`       |
| 6   | Dashboard page | 6 × `TierCard` with placeholder data, tier-colored top stripes, progress bars, lock states |
| 7   | Types          | `curriculum.ts` and `progress.ts` type files (copy from this plan)                         |

**Week 1 verification**: Dashboard renders at `/`, glassmorphic cards display correctly, dark theme, fonts load, nav bar works.

### Week 2: Lesson Engine

| #   | Deliverable        | Details                                                                         |
| --- | ------------------ | ------------------------------------------------------------------------------- |
| 1   | `StepViewer`       | Core lesson renderer — viz + text + GoDeeper + quiz                             |
| 2   | `GoDeeper`         | Expandable section with KaTeX                                                   |
| 3   | `QuizBlock`        | Multiple choice with feedback                                                   |
| 4   | `AuthorNote`       | Collapsible callout                                                             |
| 5   | Controls           | `ParamSlider`, `ParamStepper`, `ParamToggle`                                    |
| 6   | `useLesson` hook   | Step navigation state machine                                                   |
| 7   | `Sidebar` (lesson) | Step list with completion indicators                                            |
| 8   | Step navigation    | Previous/Next, keyboard shortcuts (←→), progress bar                            |
| 9   | First content      | Vectors module — full `config.ts`, `steps.ts`, `playground.ts`, `challenges.ts` |
| 10  | Content registry   | `contentRegistry.ts` — load modules from content folders                        |

**Week 2 verification**: Navigate to Vectors module, step through all guided steps, Go Deeper expands/collapses with KaTeX, quiz works, Previous/Next works.

### Week 3–4: Tier 0 Visualizations

| #   | Deliverable         | Details                                                               |
| --- | ------------------- | --------------------------------------------------------------------- |
| 1   | 13 viz components   | One per Tier 0 module (see `visualizations/tier0/` in file structure) |
| 2   | 13 content packages | Steps + playground + challenges for each module                       |
| 3   | Playground pages    | Phase 2 with full viz + parameter controls + "Try This" panel         |
| 4   | Challenge pages     | Phase 3 with ChallengeCards + completion detection                    |
| 5   | `CanvasWrapper`     | Shared responsive canvas base component                               |
| 6   | `KonvaStage`        | Shared Konva stage wrapper                                            |

**Week 3-4 verification**: All 13 Tier 0 modules completable end-to-end. Each visualization renders correctly and responds to user interaction.

### Week 5–6: Tier 1 Visualizations

| #   | Deliverable         | Details                                           |
| --- | ------------------- | ------------------------------------------------- |
| 1   | 12 viz components   | One per Tier 1 module                             |
| 2   | 12 content packages | Steps + playground + challenges                   |
| 3   | `LossLandscape3D`   | React Three Fiber integration — first 3D viz      |
| 4   | Visx charts         | Loss curves, metric charts for comparison visuals |

**Week 5-6 verification**: All 12 Tier 1 modules completable. 3D loss landscape rotates and interacts. Visx charts render.

### Week 7: Polish & Gamification

| #   | Deliverable                   | Details                                        |
| --- | ----------------------------- | ---------------------------------------------- |
| 1   | `useProgress` hook            | Full localStorage CRUD with ProgressState      |
| 2   | `useStreak` hook              | Daily tracking with midnight reset             |
| 3   | `StreakCounter`               | Fire emoji + count in TopNav                   |
| 4   | `ActivityCalendar`            | GitHub-style heatmap on profile page           |
| 5   | Badges                        | Predefined milestone badges + display grid     |
| 6   | Tier gating                   | 70% unlock check, lock UI on dashboard         |
| 7   | Roadmap page                  | Visual node graph of module connections        |
| 8   | Profile page                  | Stats, calendar, badges                        |
| 9   | Animations                    | Framer Motion page transitions, hover effects  |
| 10  | "Continue where you left off" | Dashboard banner linking to last accessed step |

**Week 7 verification**: Progress persists across page reloads. Streak increments daily. Completing 70% of Tier 0 unlocks Tier 1.

### Week 8: Deploy & Launch

| #   | Deliverable    | Details                                                    |
| --- | -------------- | ---------------------------------------------------------- |
| 1   | Vercel deploy  | Connect repo, configure build command                      |
| 2   | SEO            | `<title>`, `<meta description>`, OG images per page        |
| 3   | Performance    | Lighthouse audit, lazy-load viz components, code splitting |
| 4   | Responsive     | Tablet-friendly layouts (full mobile is post-V1)           |
| 5   | Error handling | 404 page, error boundaries around visualizations           |
| 6   | Final QA       | All ~30 modules playable start-to-finish                   |

---

## Verification Plan

### Automated (Every PR)

```bash
npx tsc --noEmit           # Type checking
npm run lint               # ESLint
npm run build              # Production build (catches SSR errors)
```

### Browser Testing (Weekly)

| Week | What to Test                                                                    |
| ---- | ------------------------------------------------------------------------------- |
| 1    | Dashboard renders, glass cards display, dark theme, fonts, nav                  |
| 2    | Step through Vectors module fully, KaTeX renders, quiz works, Go Deeper expands |
| 3-4  | All 13 Tier 0 modules: guided + playground + challenges all functional          |
| 5-6  | All 12 Tier 1 modules, 3D loss landscape works, Visx charts render              |
| 7    | Progress persists, streak works, tier gating works, badges appear               |
| 8    | Deployed URL loads, Lighthouse > 80, all routes work, no 404s                   |

### Manual (User)

- Navigate at least 3 complete modules end-to-end
- Verify KaTeX rendering in Go Deeper sections
- Test tier gating (complete 70% of Tier 0 → Tier 1 unlocks)
- Close browser → reopen → progress intact
- Visual check on Chrome + Firefox desktop

---

## Brainstorm Cross-Reference Map

When you need deeper context on any decision, reference these brainstorm sections:

| Topic                                           | Brainstorm Section                        |
| ----------------------------------------------- | ----------------------------------------- |
| Why Next.js, why not Astro/Remix                | §1: Platform Architecture & Tech Stack    |
| Full curriculum (82 modules, all tiers)         | §2: Content Structure & Curriculum Design |
| Lesson format rationale, step formula diagram   | §3 + §14: Lesson Format                   |
| Visualization library comparison                | §9: Visualization Technology Deep Dive    |
| Dark Glass Lab design direction, why dark theme | §5: UI/UX Design Direction                |
| Navigation patterns, sidebar vs bottom nav      | §6: Navigation & Learning Path Design     |
| Gamification level system (why Level 2)         | §7: Progress, Motivation & Gamification   |
| Author's notes design                           | §8: The "Learner's Notes" Question        |
| Backend roadmap (V2 Supabase, V3 FastAPI)       | §10: Backend & Compute Considerations     |
| Why Vercel for deploy                           | §11: Deployment Strategy                  |
| Naming/branding ideas                           | §12: Naming & Branding                    |
| Tracks (CV, NLP, RL, Generative, Research)      | §14: The Recommended V1                   |
| Scaling to 500+ modules, contributor pipeline   | §15: Scalability Strategy                 |
| Go Deeper expandable depth layers               | §14: Lesson Format section                |
