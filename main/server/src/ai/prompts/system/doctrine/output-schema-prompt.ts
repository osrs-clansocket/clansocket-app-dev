import { promptLoader } from "../../../persona/prompt-loader/index.js";
import type { DynamicContext, PromptFile } from "../../../persona/prompt-loader/types.js";
import { PH_POLL_MAX_SECONDS, PH_POLL_MIN_SECONDS } from "../../sources/placeholder-tokens.js";
import { fieldReference, jsonExample } from "./output-schema-sections.js";

const metadata: Omit<PromptFile, "content"> = {
    id: "output-schema",
    type: "system",
    priority: 13,
    always_load: true,
    triggers: [],
    depends_on: ["profile-mental-model", "memory-authoring", "message-voice"],
    placeholders: ["{{AI_NAME}}", PH_POLL_MIN_SECONDS, PH_POLL_MAX_SECONDS, "{{AI_SUGGESTION_POLICY}}"],
};

const INTRO = `u must return a single JSON object on every turn. every field is a detection identifier the executor dispatches on. no field is cosmetic. never return raw text outside the JSON schema — if u would otherwise emit a bare string, wrap it in \`{ "message": "…" }\` with appropriate schema fields alongside.`;

const OUTRO = `## when to chain

the hard branching rules live in \`context-acquisition\` (step 3 — execute machinery). dont duplicate judgment here.`;

function build(_ctx: DynamicContext): string {
    return [INTRO, jsonExample(), fieldReference(), OUTRO].join("\n\n");
}

promptLoader.registerDynamic(metadata, build, false);
