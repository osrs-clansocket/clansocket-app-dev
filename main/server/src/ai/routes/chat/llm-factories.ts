import { type LanguageModel } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createGroq } from "@ai-sdk/groq";
import { createCohere } from "@ai-sdk/cohere";
import { createPerplexity } from "@ai-sdk/perplexity";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const PROVIDER_FACTORIES: Record<string, (apiKey: string, model: string) => LanguageModel> = {
    anthropic: (apiKey, model) => createAnthropic({ apiKey })(model),
    openai: (apiKey, model) => createOpenAI({ apiKey })(model),
    gemini: (apiKey, model) => createGoogleGenerativeAI({ apiKey })(model),
    mistral: (apiKey, model) => createMistral({ apiKey })(model),
    groq: (apiKey, model) => createGroq({ apiKey })(model),
    cohere: (apiKey, model) => createCohere({ apiKey })(model),
    perplexity: (apiKey, model) => createPerplexity({ apiKey })(model),
};

for (const [name, baseURL] of [
    ["openrouter", "https://openrouter.ai/api/v1"],
    ["ai21", "https://api.ai21.com/studio/v1"],
] as const) {
    PROVIDER_FACTORIES[name] = (apiKey, model) => createOpenAICompatible({ apiKey, name, baseURL }).chatModel(model);
}

export function buildLanguageModel(provider: string, apiKey: string, model: string): LanguageModel {
    const factory = PROVIDER_FACTORIES[provider];
    if (!factory) throw new Error(`Unsupported provider: ${provider}`);
    return factory(apiKey, model);
}
