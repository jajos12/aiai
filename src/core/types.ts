import React from 'react';

export type VisualizationProps = Record<string, unknown>;
export interface ChallengeCanvasProps {
  challenge: Challenge;
  onComplete: () => void;
}
export type VisualizationComponent = React.ComponentType<VisualizationProps>;
export type ChallengeCanvasComponent = React.ComponentType<ChallengeCanvasProps>;

/** A single tier in the curriculum (Tier 0, Tier 1, etc.) */
export interface Tier {
  id: number;
  title: string;
  emoji: string;
  color: string;
  description: string;
  recommendedCompletionRatio: number;
  clusters: Cluster[];
}

/** A sub-group of modules within a tier */
export interface Cluster {
  id: string;
  title: string;
  emoji: string;
  modules: Module[];
}

/** A single learning module data (static content/config) */
export interface ModuleData {
  id: string;
  tierId: number;
  clusterId: string;
  title: string;
  description: string;
  tags: string[];
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'research';
  estimatedMinutes: number;
  steps: Step[];
  playground: PlaygroundConfig;
  challenges: Challenge[];
}

/** A full module instance (merged data + visualizations) */
export interface Module extends ModuleData {
  /** 
   * The actual visualization component for this module.
   * This decoupled approach lets modules define their own rendering logic.
   */
  Visualization?: VisualizationComponent;

  /**
   * Specialized challenge canvas for this module (optional).
   */
  ChallengeCanvas?: ChallengeCanvasComponent;
}

export interface ModuleBundle {
  moduleData: ModuleData;
  Visualization?: VisualizationComponent;
  ChallengeCanvas?: ChallengeCanvasComponent;
}

/** A single guided exploration step */
export interface Step {
  id: string;
  title: string;
  concepts?: string[];
  /**
   * Props passed to the module's Visualization component during this step.
   */
  visualizationProps: VisualizationProps;
  content: {
    text: string;
    goDeeper?: GoDeeper;
    authorNote?: string;
    image?: {
      url: string;
      provider?: string;
      assetId?: string;
    };
    video?: {
      url: string;
      provider?: string;
      assetId?: string;
    };
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
  concepts?: string[];
  /** Which visualization component to use for this challenge */
  component?: string;
  /** Override props for the visualization in this challenge */
  props?: Record<string, unknown>;
  completionCriteria: {
    type: 'threshold' | 'exact' | 'custom' | 'distance';
    target: number | string | { x: number; y: number };
    metric: string;
  };
  hints?: string[];
  maxAttempts?: number;
}
