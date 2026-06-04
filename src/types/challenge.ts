export interface Challenge {
  id: string;
  instruction: string;
  hint?: string;
  solutionHint: string;
  initialState?: (store: any) => void;
  validationType: 'command' | 'state' | 'both';
  expectedCommandRegex?: RegExp;
  validateState?: (store: any) => string | null;
  commands: string[];
  category: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
}

export interface ChallengeResult {
  challengeId: string;
  completed: boolean;
  attempts: number;
  lastError?: string;
  completedAt?: number;
}

export interface ValidationResult {
  passed: boolean;
  reason?: string;
}
