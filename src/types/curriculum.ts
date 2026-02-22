// src/types/curriculum.ts

/** A single tier in the curriculum (Tier 0, Tier 1, etc.) */
export interface Tier {
  id: number;
  title: string;
  emoji: string;
  color: string;
  description: string;
  unlockThreshold: number;
  clusters: Cluster[];
}

/** A sub-group of modules within a tier */
export interface Cluster {
  id: string;
  title: string;
  emoji: string;
  modules: Module[];
}

/** A single learning module (e.g., "Vectors & Matrices") */
export interface Module {
  id: string;
  tierId: number;
  clusterId: string;
  title: string;
  description: string;
  tags: string[];
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'research';
  estimatedMinutes: number;
  visualizationComponent: string;
  steps: Step[];
  playground: PlaygroundConfig;
  challenges: Challenge[];
}

/** A single guided exploration step */
export interface Step {
  id: string;
  title: string;
  visualization: {
    component: string;
    props: Record<string, unknown>;
  };
  content: {
    text: string;
    goDeeper?: GoDeeper;
    authorNote?: string;
  };
  quiz?: Quiz;
  interactionHint?: string;
}

/** Expandable "Go Deeper" formal content */
export interface GoDeeper {
  math?: string;
  explanation: string;
  references?: Reference[];
}

export interface Reference {
  title: string;
  author: string;
  url?: string;
  year?: number;
}

/** Quiz question */
export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Playground configuration */
export interface PlaygroundConfig {
  description: string;
  component: string;
  parameters: PlaygroundParam[];
  tryThis: string[];
}

export interface PlaygroundParam {
  id: string;
  label: string;
  type: 'slider' | 'stepper' | 'toggle' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean | string;
  options?: string[];
}

/** Challenge task */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  component: string;
  completionCriteria: {
    type: 'threshold' | 'exact' | 'custom';
    target: number | string;
    metric: string;
  };
  hints?: string[];
  maxAttempts?: number;
}
