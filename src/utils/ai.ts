import { AIConfig, AIProfileConfig, AIProviderInfo, ProposedRoutine, ChatMessage } from '../types/ai';

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    key: 'custom',
    name: 'OpenAI 兼容(自定义)',
    badge: '第三方/转发/本地',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    presetModels: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'claude-3-5-sonnet', 'deepseek-chat', 'qwen-plus'],
    placeholderKey: '粘贴 API Key',
  },
  {
    key: 'deepseek',
    name: 'DeepSeek',
    badge: '超高性价比',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    presetModels: ['deepseek-chat', 'deepseek-reasoner'],
    placeholderKey: '粘贴 API Key (sk-...)',
    docUrl: 'https://platform.deepseek.com',
  },
  {
    key: 'zhipu',
    name: '智谱 GLM',
    badge: '中文理解佳',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    presetModels: ['glm-4-flash', 'glm-4-plus', 'glm-4-air', 'glm-4'],
    placeholderKey: '粘贴 API Key',
    docUrl: 'https://open.bigmodel.cn',
  },
  {
    key: 'moonshot',
    name: '月之暗面 Kimi',
    badge: '长文本与推理',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    presetModels: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    placeholderKey: '粘贴 API Key (sk-...)',
    docUrl: 'https://platform.moonshot.cn',
  },
  {
    key: 'qwen',
    name: '阿里通义千问',
    badge: '阿里官方大模型',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    presetModels: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen2.5-72b-instruct'],
    placeholderKey: '粘贴 API Key (sk-...)',
    docUrl: 'https://dashscope.aliyun.com',
  },
  {
    key: 'doubao',
    name: '字节豆包(火山方舟)',
    badge: '火山引擎大模型',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    presetModels: ['doubao-pro-32k', 'doubao-pro-128k', 'doubao-lite-32k'],
    placeholderKey: '粘贴 API Key',
    docUrl: 'https://www.volcengine.com/product/ark',
  },
  {
    key: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o 系列',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    presetModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'o1-mini'],
    placeholderKey: '粘贴 API Key (sk-...)',
    docUrl: 'https://platform.openai.com',
  },
  {
    key: 'gemini',
    name: 'Google Gemini (官方內建)',
    badge: '免配置 Key',
    defaultBaseUrl: '',
    defaultModel: 'gemini-3.8-flash',
    presetModels: ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
    placeholderKey: '已內建系統金鑰，可直接暢享對話',
    isBuiltIn: true,
  },
];

const STORAGE_KEY_AI_CONFIG = 'flowtimer_ai_config_v1';
const STORAGE_KEY_AI_PROFILES = 'flowtimer_ai_profiles_v2';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'flowtimer_ai_active_profile_id_v2';
const STORAGE_KEY_AI_CHAT = 'flowtimer_ai_chat_v1';

export const DEFAULT_AI_PROFILES: AIProfileConfig[] = [
  {
    id: 'profile-default',
    name: '默认配置',
    provider: 'custom',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  {
    id: 'profile-deepseek',
    name: 'DeepSeek 高速',
    provider: 'deepseek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  {
    id: 'profile-gemini',
    name: 'Gemini 官方內建',
    provider: 'gemini',
    apiKey: '',
    baseUrl: '',
    model: 'gemini-3.8-flash',
  },
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'custom',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  profileId: 'profile-default',
};

export function getSavedAIProfiles(): AIProfileConfig[] {
  if (typeof window === 'undefined') return DEFAULT_AI_PROFILES;
  const raw = localStorage.getItem(STORAGE_KEY_AI_PROFILES);
  if (!raw) {
    saveAIProfiles(DEFAULT_AI_PROFILES);
    return DEFAULT_AI_PROFILES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AI_PROFILES;
  } catch {
    return DEFAULT_AI_PROFILES;
  }
}

export function saveAIProfiles(profiles: AIProfileConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_AI_PROFILES, JSON.stringify(profiles));
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined') return 'profile-default';
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID) || 'profile-default';
}

export function setActiveProfileId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, id);
}

export function getSavedAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  const profiles = getSavedAIProfiles();
  const activeId = getActiveProfileId();
  const currentProfile = profiles.find((p) => p.id === activeId) || profiles[0];

  if (currentProfile) {
    return {
      provider: currentProfile.provider,
      apiKey: currentProfile.apiKey,
      baseUrl: currentProfile.baseUrl,
      model: currentProfile.model,
      profileId: currentProfile.id,
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
  if (!raw) return DEFAULT_AI_CONFIG;
  try {
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(config));

  // Sync to active profile
  const profiles = getSavedAIProfiles();
  const activeId = config.profileId || getActiveProfileId();
  const updatedProfiles = profiles.map((p) =>
    p.id === activeId
      ? {
          ...p,
          provider: config.provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
        }
      : p
  );
  saveAIProfiles(updatedProfiles);
}

// Fetch remote models from proxy
export async function fetchRemoteModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const response = await fetch('/api/models', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      baseUrl,
      apiKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `拉取模型失敗 (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data.models) ? data.models : [];
}

export function getSavedChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_AI_CHAT);
  if (!raw) {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          '你好！我是你的專屬 AI 運動教練 🏃‍♀️\n\n告訴我你今天想練什麼、有多少時間、或身體有哪些需求（例如：想練核心無跳躍、辦公室肩頸放鬆、TABATA 燃脂等），我會為你度身定制一套專屬間歇訓練組合，在對話中我們可以隨時修改，滿意後一鍵加入訓練清單！',
        timestamp: Date.now(),
        proposedRoutine: null,
      },
    ];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatHistory(history: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_AI_CHAT, JSON.stringify(history));
}

// Extract proposed routine from AI response text
export function extractProposedRoutine(text: string): { cleanText: string; routine: ProposedRoutine | null } {
  // Regex to match ```workout_routine ... ``` or ```json ... ``` with title & exercises
  const match = text.match(/```(?:workout_routine|json)?\s*([\s\S]*?)\s*```/);
  if (!match) {
    return { cleanText: text, routine: null };
  }

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed && typeof parsed === 'object' && parsed.title && Array.isArray(parsed.exercises)) {
      const cleanText = text.replace(match[0], '').trim();
      return {
        cleanText,
        routine: parsed as ProposedRoutine,
      };
    }
  } catch (e) {
    // parse failed
  }

  return { cleanText: text, routine: null };
}

// Send chat message to server proxy
export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: AIConfig
): Promise<string> {
  const provider = config.provider || 'gemini';
  const providerInfo = AI_PROVIDERS.find((p) => p.key === provider);

  const customConfig = {
    apiKey: config.apiKey?.trim() || undefined,
    baseUrl: (config.baseUrl?.trim() || providerInfo?.defaultBaseUrl)?.replace(/\/$/, ''),
    model: config.model?.trim() || providerInfo?.defaultModel,
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      provider,
      customConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `請求失敗 (${response.status})`);
  }

  const data = await response.json();
  return data.content || '';
}
