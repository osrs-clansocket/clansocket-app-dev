import type { TokenSource } from "./render-template.js";

export interface RenderContext {
    rsn: string;
    clanName: string | null;
    botId: string;
}

export function renderContext(rsn: string, clanName: string | null, botId: string): RenderContext {
    return { rsn, clanName, botId };
}

export interface RenderedBody {
    username: string;
    content: string;
    embed: object | null;
    tokens: TokenSource;
}

export interface RendererInput {
    payload: object;
    context: RenderContext;
}

export type Renderer = (input: RendererInput) => RenderedBody;

export interface RenderResultArgs {
    username: string;
    content: string;
    tokens: TokenSource;
    embed?: object | null;
}

export function renderResult(args: RenderResultArgs): RenderedBody {
    return { username: args.username, content: args.content, embed: args.embed ?? null, tokens: args.tokens };
}
