export type ExplainLevel = 'eli5' | 'standard' | 'expert';

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StepExplanation {
  text: string;
  goDeeper?: {
    explanation: string;
  };
}
