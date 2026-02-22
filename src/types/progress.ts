// src/types/progress.ts

/** Full persisted progress state */
export interface ProgressState {
  version: number;
  lastUpdated: string;
  streak: StreakData;
  tiers: Record<number, TierProgress>;
  badges: string[];
  activityLog: ActivityEntry[];
  settings: UserSettings;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export interface TierProgress {
  unlocked: boolean;
  modules: Record<string, ModuleProgress>;
}

export interface ModuleProgress {
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  stepsCompleted: string[];
  quizAnswers: Record<string, number>;
  challengesCompleted: string[];
  playgroundVisited: boolean;
  lastAccessedStep: string;
  completedAt?: string;
}

export interface ActivityEntry {
  date: string;
  modulesWorkedOn: string[];
  stepsCompleted: number;
  minutesSpent: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  goDeeper: 'collapsed' | 'expanded';
  animationSpeed: 'slow' | 'normal' | 'fast';
  sidebarCollapsed: boolean;
}
