export type AIProvider =
  | 'custom'
  | 'deepseek'
  | 'zhipu'
  | 'moonshot'
  | 'qwen'
  | 'doubao'
  | 'openai';

export interface AIProviderInfo {
  key: AIProvider;
  name: string;
  badge: string;
  defaultBaseUrl: string;
  defaultModel: string;
  presetModels: string[];
  placeholderKey: string;
  docUrl?: string;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  profileId?: string;
}

export interface AIProfileConfig {
  id: string;
  name: string;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ProposedRoutineExercise {
  name: string;
  sets: number;
  workSeconds: number;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface ProposedRoutine {
  title: string;
  description: string;
  tag: string;
  prepareSeconds?: number;
  exercises: ProposedRoutineExercise[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  proposedRoutine?: ProposedRoutine | null;
  isAddedToRoutines?: boolean;
}
