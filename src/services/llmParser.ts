import { ShoppingIntent, LLMConfig, RecipeIngredient, ProductCategory } from '../types';
import { parseNaturalLanguageInput, ParseResult, createCustomRecipeIntent } from './intentParser';
import { PREDEFINED_RECIPES } from '../data/recipes';
import { normalizeIngredientName } from './ingredientNormalizer';

const STORAGE_KEY = 'shopsmarter_llm_config';

// Default configuration with environment variable fallbacks
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  enabled: (import.meta as any).env?.VITE_LLM_ENABLED === 'true',
  provider: ((import.meta as any).env?.VITE_LLM_PROVIDER as any) || 'gemini',
  apiKey: (import.meta as any).env?.VITE_LLM_API_KEY || '',
  endpoint: (import.meta as any).env?.VITE_LLM_ENDPOINT || '',
  model: (import.meta as any).env?.VITE_LLM_MODEL || 'gemini-1.5-flash'
};

// Retrieve current LLM configuration (combines storage and defaults)
export function getLLMConfig(): LLMConfig {
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_LLM_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback on error
    }
  }
  return DEFAULT_LLM_CONFIG;
}

// Persist LLM configuration
export function saveLLMConfig(newConfig: Partial<LLMConfig>): LLMConfig {
  const current = getLLMConfig();
  const updated: LLMConfig = { ...current, ...newConfig };
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save LLM config to localStorage:', e);
    }
  }
  return updated;
}

// System prompt explaining the desired structured JSON decomposition
const SYSTEM_PROMPT = `You are an AI grocery & shopping intent extraction assistant for Shopsmarter.
Your job is to analyze natural language user shopping requests and decompose them into structured JSON.

User input can contain:
1. Recipes/dishes to cook (e.g. "Spaghetti bolognese for 2", "Want to make beef stew", "煮麻婆豆腐")
2. Direct household or grocery items (e.g. "milk", "paper towels", "toilet paper", "detergent")
3. A combination of both.

Return ONLY a valid JSON object matching this TypeScript interface (no markdown code fence, no additional commentary):
{
  "recipes": [
    {
      "dishName": string,
      "servings": number,
      "ingredients": [
        {
          "name": string,
          "quantity": number,
          "unit": "piece" | "g" | "ml" | "clove" | "tbsp" | "pack",
          "category": "Vegetables" | "Fruits" | "Dairy" | "Meat" | "Rice and grains" | "Pasta" | "Cooking ingredients" | "Asian specialty ingredients"
        }
      ]
    }
  ],
  "directItems": [
    {
      "name": string,
      "quantity": number,
      "unit": "pack" | "bottle" | "box" | "piece",
      "category": "Dairy" | "Cleaning supplies" | "Toiletries" | "Paper products" | "Household essentials"
    }
  ],
  "explanation": string
}`;

interface RawLLMResponse {
  recipes?: {
    dishName: string;
    servings?: number;
    ingredients?: {
      name: string;
      quantity: number;
      unit: string;
      category?: string;
    }[];
  }[];
  directItems?: {
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
  }[];
  explanation?: string;
}

// Parse using Google Gemini REST API
async function callGemini(prompt: string, apiKey: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Input: "${prompt}"` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// Parse using OpenAI / OpenAI-compatible endpoint
async function callOpenAI(prompt: string, apiKey: string, model: string = 'gpt-4o-mini', endpoint?: string): Promise<string> {
  const url = endpoint || 'https://api.openai.com/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

// Parse using local Ollama instance
async function callOllama(prompt: string, endpoint?: string, model: string = 'llama3'): Promise<string> {
  const url = endpoint || 'http://localhost:11434/api/generate';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${SYSTEM_PROMPT}\n\nUser Input: "${prompt}"`,
      format: 'json',
      stream: false
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data?.response || '';
}

// Transform raw LLM JSON structure into verified ShoppingIntents
function transformLLMResponseToIntents(rawJsonStr: string, rawInput: string): ParseResult {
  // Strip any accidental markdown formatting
  const cleanJson = rawJsonStr.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  const parsed: RawLLMResponse = JSON.parse(cleanJson);

  const intents: ShoppingIntent[] = [];

  // 1. Process recipes
  if (Array.isArray(parsed.recipes)) {
    for (const r of parsed.recipes) {
      if (!r.dishName) continue;
      const servings = r.servings && r.servings > 0 ? r.servings : 2;

      // Check if it matches an existing catalog recipe first
      const catalogMatch = PREDEFINED_RECIPES.find((rec) =>
        rec.aliases.some((alias) => r.dishName.toLowerCase().includes(alias.toLowerCase())) ||
        r.dishName.toLowerCase().includes(rec.name.toLowerCase())
      );

      if (catalogMatch) {
        intents.push({
          id: `intent_${catalogMatch.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'recipe',
          recipeId: catalogMatch.id,
          recipeName: catalogMatch.name,
          servings,
          rawText: r.dishName,
          createdAt: new Date().toISOString()
        });
      } else {
        // Custom recipe with LLM-decomposed ingredients
        const ingredients: RecipeIngredient[] = (r.ingredients || []).map((ing) => ({
          ingredientId: normalizeIngredientName(ing.name),
          name: ing.name,
          quantity: ing.quantity || 1,
          unit: ing.unit || 'piece',
          category: (ing.category as ProductCategory) || 'Vegetables'
        }));

        intents.push(createCustomRecipeIntent(r.dishName, servings, ingredients));
      }
    }
  }

  // 2. Process direct household/grocery items
  if (Array.isArray(parsed.directItems)) {
    for (const di of parsed.directItems) {
      if (!di.name) continue;
      intents.push({
        id: `intent_direct_${di.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'direct_item',
        directItem: {
          name: di.name,
          quantity: di.quantity || 1,
          unit: di.unit || 'pack',
          category: (di.category as ProductCategory) || 'Household essentials'
        },
        rawText: di.name,
        createdAt: new Date().toISOString()
      });
    }
  }

  return {
    intents,
    unrecognizedTokens: [],
    explanation: parsed.explanation || `AI decomposed ${intents.length} shopping intent(s) from your request.`
  };
}

/**
 * Universal Natural Language Parser with LLM Adapter support.
 *
 * If LLM is not enabled or credentials are not supplied, it executes instantly
 * using the local deterministic recipe and heuristic parser (zero latency).
 *
 * If LLM is enabled and configured, it calls the specified model with automatic
 * graceful fallback to the local parser upon any network/API exception.
 */
export async function parseNaturalLanguageWithLLM(
  rawInput: string,
  customConfig?: Partial<LLMConfig>
): Promise<ParseResult> {
  const config: LLMConfig = { ...getLLMConfig(), ...customConfig };

  // If LLM disabled or missing API key (unless using local Ollama)
  if (!config.enabled || (!config.apiKey && config.provider !== 'ollama')) {
    return parseNaturalLanguageInput(rawInput);
  }

  try {
    let rawResponse = '';
    const model = config.model || (config.provider === 'gemini' ? 'gemini-1.5-flash' : config.provider === 'openai' ? 'gpt-4o-mini' : 'llama3');

    if (config.provider === 'gemini') {
      rawResponse = await callGemini(rawInput, config.apiKey!, model);
    } else if (config.provider === 'openai') {
      rawResponse = await callOpenAI(rawInput, config.apiKey!, model, config.endpoint);
    } else if (config.provider === 'ollama') {
      rawResponse = await callOllama(rawInput, config.endpoint, model);
    } else if (config.provider === 'custom' && config.endpoint) {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rawInput })
      });
      rawResponse = await res.text();
    }

    if (rawResponse) {
      return transformLLMResponseToIntents(rawResponse, rawInput);
    }
  } catch (error) {
    console.warn('[Shopsmarter LLM Parser] LLM API call failed, falling back to local heuristic parser:', error);
  }

  // Graceful fallback to rule-based parser on any failure
  return parseNaturalLanguageInput(rawInput);
}
