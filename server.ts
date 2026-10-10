import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const SYSTEM_INSTRUCTION = `你是一位專業、親切且鼓勵人心的專業健身與運動教練。
你的任務是根據使用者的身體狀況、時間限制、運動目標與偏好（如：核心雕塑、全身燃脂、辦公室肩頸放鬆、產後修復、膝蓋友善、無跳躍、TABATA 等），為他們量身客製專屬的「運動間歇訓練組合」。

回答原則：
1. 語氣溫暖柔和、專業清晰，使用繁體中文交流。
2. 每次為使用者推薦或調整訓練組合時，請在對話中附上簡要解說，並【務必】在回覆內容最後輸出一個格式嚴格正確的 JSON 代碼區塊，標記為 \`\`\`workout_routine，以便系統為使用者直接生成互動卡片並一鍵加入訓練清單。
3. 如果使用者在後續對話中提出修改需求（例如：「太累了，組數減一組」、「膝蓋不舒服，把深蹲換成臀橋」、「休息時間拉長到25秒」），請熱情回應並輸出修改後的完整 \`\`\`workout_routine 代碼塊。

JSON 代碼塊格式範例：
\`\`\`workout_routine
{
  "title": "15分鐘無跳躍核心燃脂",
  "description": "零關節衝擊，專注腹直肌與深層腹橫肌發力，燃燒熱量不傷膝。",
  "tag": "核心溫和",
  "prepareSeconds": 5,
  "exercises": [
    {
      "name": "平板支撐 (Plank)",
      "sets": 3,
      "workSeconds": 30,
      "restSeconds": 20,
      "notes": "手肘在肩膀正下方，腹部微收勿塌腰"
    },
    {
      "name": "仰臥單車 (Bicycle Crunches)",
      "sets": 3,
      "workSeconds": 30,
      "restSeconds": 20,
      "notes": "緩慢旋轉軀幹，手肘找對側膝蓋"
    },
    {
      "name": "臀橋 (Glute Bridge)",
      "sets": 3,
      "workSeconds": 35,
      "restSeconds": 15,
      "notes": "頂峰收緊臀部停頓1秒"
    },
    {
      "name": "眼鏡蛇式放鬆拉伸",
      "sets": 2,
      "workSeconds": 40,
      "restSeconds": 15,
      "notes": "配合深長呼吸，溫和伸展腹部"
    }
  ]
}
\`\`\`
請確保輸出的 JSON 欄位完全符合上述結構。若使用者只是詢問飲食或健身知識，則無需輸出 workout_routine 代碼塊，以專業耐心的教練角度解答即可。`;

// Append auto-collected user context (profile, goals, progress, workout history)
function buildSystemInstruction(userContext?: string): string {
  if (!userContext || !userContext.trim()) return SYSTEM_INSTRUCTION;
  return `${SYSTEM_INSTRUCTION}

【系統自動擷取的使用者最新檔案與訓練記錄】
以下資料由系統自動提供，請在問答與設計訓練組合時主動參考（例如依目標進度調整頻率、強度，並給予針對性鼓勵），但不要在回覆中逐字重複這些內容：
${userContext}`;
}

// Provider default endpoints & models
const PROVIDER_DEFAULTS = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    envKey: 'DEEPSEEK_API_KEY',
  },
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    envKey: 'ZHIPU_API_KEY',
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    envKey: 'DASHSCOPE_API_KEY',
  },
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    envKey: 'MOONSHOT_API_KEY',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    envKey: 'OPENAI_API_KEY',
  },
};

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// AI Chat Proxy endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, provider = 'custom', customConfig, userContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '請提供有效的 messages 對話記錄。' });
    }

    // OpenAI-compatible providers (DeepSeek, 智譜清言 GLM, 阿里通義千問, 月之暗面 Kimi, OpenAI, 自定義接口)
    const defaults = PROVIDER_DEFAULTS[provider as keyof typeof PROVIDER_DEFAULTS];
    const baseUrl = (customConfig?.baseUrl || defaults?.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = customConfig?.model || defaults?.model || 'gpt-4o-mini';
    const envKeyName = defaults?.envKey;
    const apiKey = customConfig?.apiKey || (envKeyName ? process.env[envKeyName] : '') || process.env.CUSTOM_AI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: `請輸入 ${provider.toUpperCase()} 的 API Key，或在伺服器環境變數中設定。`,
      });
    }

    const endpoint = `${baseUrl}/chat/completions`;

    // Format messages for OpenAI compatibility
    const openaiMessages = [
      { role: 'system', content: buildSystemInstruction(userContext) },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.7,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({
        error: `AI 平台回應錯誤 (${apiRes.status}): ${errText.slice(0, 300)}`,
      });
    }

    const data = await apiRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    return res.json({
      content,
      provider,
      model,
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : '伺服器處理 AI 對話時發生錯誤';
    return res.status(500).json({ error: message });
  }
});

// Fetch available models from an OpenAI-compatible endpoint (GET /models)
app.post('/api/models', async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey } = req.body;

    if (!baseUrl || typeof baseUrl !== 'string') {
      return res.status(400).json({ error: '請先填寫有效的 Base URL。' });
    }

    const url = `${baseUrl.replace(/\/$/, '')}/models`;

    const apiRes = await fetch(url, {
      method: 'GET',
      headers: apiKey ? { Authorization: `Bearer ${String(apiKey).trim()}` } : {},
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => '');
      return res.status(apiRes.status).json({
        error: `拉取模型失敗 (${apiRes.status}): ${errText.slice(0, 200)}`,
      });
    }

    const data = await apiRes.json();

    // OpenAI-compatible: { data: [{ id }] }; some gateways return { models: [...] }
    let models: string[] = [];
    if (Array.isArray(data.data)) {
      models = data.data
        .map((m: unknown) => (typeof m === 'string' ? m : (m as { id?: string }).id))
        .filter((m: unknown): m is string => Boolean(m));
    } else if (Array.isArray(data.models)) {
      models = data.models
        .map((m: unknown) => (typeof m === 'string' ? m : (m as { id?: string; name?: string }).id || (m as { name?: string }).name))
        .filter((m: unknown): m is string => Boolean(m));
    }

    return res.json({ models: Array.from(new Set(models)) });
  } catch (error: unknown) {
    console.error('Fetch models error:', error);
    const message = error instanceof Error ? error.message : '伺服器拉取模型時發生錯誤';
    return res.status(500).json({ error: message });
  }
});

// Setup Vite middleware in dev or static server in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`FlowTimer Server listening on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
