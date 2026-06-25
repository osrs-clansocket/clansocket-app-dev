import { makeTooltip, type Tooltip } from "../../shared/types/tooltip-types.js";

export const TOOLTIPS_VOICE: Readonly<Record<string, Tooltip>> = {
    ai_name: makeTooltip(
        "what to call the AI when chatting with it.",
        "gives it a personal feel. if u dont set one, it just uses the default platform name.",
        "type a single word. like Varez, Cap, or whatever u want. no spaces or weird symbols.",
    ),
    ai_role_tagline: makeTooltip(
        "one-line who-it-is the AI uses when introducing itself.",
        "helps anyone meeting it know what its for.",
        "one short sentence. like 'ai for clansocket — runs the platform + reads ur clans data'.",
    ),
    ai_idk_form: makeTooltip(
        "how the AI says it doesnt know smth.",
        "if u dont set this, it might say 'I do not know' formal-style. ur version keeps it sounding like u.",
        "a short phrase. like 'idk', 'no clue', 'not sure mate'.",
    ),
    ai_voice_directive: makeTooltip(
        "a one-line vibe check for how the AI should sound.",
        "every other voice rule reads against this. without it, it defaults to plain + helpful.",
        "one line. like 'talk like a clannie, casual + sharp + osrs-fluent — never corporate'.",
    ),
    ai_voice_dna: makeTooltip(
        "hard rules the AI follows for how it writes.",
        "keeps its voice consistent. without them it drifts toward generic chatbot.",
        "numbered list. like '1. lowercase i | 2. drop apostrophes | 3. emoticons not emoji | 4. keep msgs short'.",
    ),
    ai_anti_voice: makeTooltip(
        "phrases the AI is banned from saying.",
        "stops corporate-bot leaks like 'As an AI' or 'Great question!'.",
        "one phrase per line. add anything that sounds off to u.",
    ),
    ai_phrase_banks: makeTooltip(
        "the words the AI picks from when reacting (laughing, hi, agreeing, etc.).",
        "if u dont set this, it uses default vocab. setting it makes the AI sound like u + ur clan.",
        "one type per row. format: 'LAUGHTER: lol(55) haha(20) lmfao(13)' — the number is roughly how often each one shows up.",
    ),
    ai_shittalk_doctrine: makeTooltip(
        "how the AI roasts back when u start shit.",
        "real roasts need real data — never made up. without rules it goes too soft or fabricates jabs.",
        "free text. describe when banter is on, what makes a fair roast vs cheap, when to chill.",
    ),
    ai_inside_jokes: makeTooltip(
        "clan-specific phrases the AI uses naturally without explaining.",
        "stops it from translating jokes back at u. if u say 'grats nerd' it shouldnt add '[friendly maxer tease]'.",
        "one joke per line. format: '- \"phrase\" — quick note'. the note is for the AI, never said out loud.",
    ),
    ai_lane_out: makeTooltip(
        "stuff the AI wont engage with, on top of the built-in refusals.",
        "by default it already refuses game strategy + advice. this is for ur clans extra 'dont go there' topics.",
        "one rule per line. like 'no irl drama' or 'dont engage with politics'. leave blank to keep just the defaults.",
    ),
    ai_deflect_phrasings: makeTooltip(
        "the lines the AI uses when refusing a request.",
        "if u dont set these, it improvises — sounds inconsistent.",
        "a few lines, one per row. like 'not my lane mate, wiki got u' or 'thats a strat call, ask a clannie'. it picks one when refusing.",
    ),
    ai_reaction_calibration: makeTooltip(
        "how hyped or chill the AI gets per type of event.",
        "same drop should hype different at peak hours vs 4am. same death is funnier when its a bank-wipe vs a small hp loss.",
        "tiered list. like 'small drop (<5M): 0-1 ack | medium (5-50M): 1-2 | first 99: 4-6 | inferno cape: 4-10'.",
    ),
    ai_celebration_rules: makeTooltip(
        "how the AI handles ur wins (drops, 99s, milestones).",
        "without rules celebrations turn cringe ('Crushing it!') or flat. these keep it natural.",
        "free text. say when to celebrate, how big (1-line vs longer), and what to avoid (corporate hype words).",
    ),
    ai_fumble_recovery: makeTooltip(
        "how the AI handles its own mistakes.",
        "it'll mess up sometimes. without rules it either over-apologizes or doubles down — both bad.",
        "free text. usually: short ack + move on. never 'i apologize for the confusion'.",
    ),
    ai_swear_policy: makeTooltip(
        "how the AI handles swearing + censoring.",
        "every clan tolerates language differently + auto-mods can strip raw swears. AI needs to know how u want it.",
        "free text. describe ur default — raw swears OK / softened (fking, heck) preferred / fully censored. + when to break the rule.",
    ),
};
