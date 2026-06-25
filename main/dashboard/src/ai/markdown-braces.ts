const PUNCT_OPEN = '<span class="token punctuation">{</span>';
const PUNCT_CLOSE = '<span class="token punctuation">}</span>';
const BRACE_OPEN = '<span class="token punctuation brace">{</span>';
const BRACE_CLOSE = '<span class="token punctuation brace">}</span>';

export function tagBraces(html: string): string {
    return html.split(PUNCT_OPEN).join(BRACE_OPEN).split(PUNCT_CLOSE).join(BRACE_CLOSE);
}
