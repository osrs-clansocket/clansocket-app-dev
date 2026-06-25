export { buildLanguageModel } from "./llm-factories.js";

const PROVIDER_PREFERRED_MODELS: Record<string, string> = {
    anthropic: "claude-haiku-4-5",
    openai: "gpt-5.4-mini",
    gemini: "gemini-3-flash",
    mistral: "mistral-small-latest",
    cohere: "command-a-03-2025",
    groq: "llama-3.3-70b-versatile",
    perplexity: "sonar",
    ai21: "jamba-mini",
};

export function resolveModel(provider: string, requested: string | undefined): string {
    if (requested && requested.length > 0) return requested;
    const preferred = PROVIDER_PREFERRED_MODELS[provider];
    if (preferred) return preferred;
    throw new Error(`No model specified and no default for provider "${provider}"`);
}
