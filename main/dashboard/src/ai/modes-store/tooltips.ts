import type { ModeKey } from "./types.js";
import { makeTooltip, type Tooltip } from "../../shared/types/tooltip-types.js";

export const MODE_TOOLTIPS: Readonly<Record<ModeKey, Tooltip>> = {
    mode_continuous: makeTooltip(
        "switches the AI from one-reply mode to live-tracking — it watches state + narrates changes.",
        "off = AI just answers when u ask. on = AI also keeps an eye on stuff + pings u when it shifts.",
        "flip it. when on, cadence + quiet hours settings show up.",
    ),
    mode_dashboard_actions: makeTooltip(
        "lets the AI click buttons + fill forms + route u around the dashboard.",
        "off = AI is read-only (narrates + answers, never executes). on = AI can drive the UI on ur behalf.",
        "flip it. destructive actions (delete clan, kick member) still need u to click — AI never fires those.",
    ),
    mode_db_queries: makeTooltip(
        "lets the AI run SELECT queries on ur live data to answer questions.",
        "off = AI can only use whats already in chat context. on = AI pulls fresh data when needed.",
        "flip it. queries are read-only — AI cant modify ur data.",
    ),
    mode_memory_authoring: makeTooltip(
        "lets the AI take long-term notes about u (recurring patterns, prefs, recipes).",
        "off = every conversation starts fresh. on = AI remembers things across sessions.",
        "flip it. memory files live in the Memory tab — u can review + delete anytime.",
    ),
    mode_pin_unpin: makeTooltip(
        "lets the AI temporarily pin context (prompts + memory notes) so they stay live across turns.",
        "also gates auto-pinning of fresh memory notes — when off, new notes are created but not auto-pinned. usually leave on.",
        "flip it. minor power-user feature.",
    ),
    mode_profile_updates: makeTooltip(
        "lets the AI build + update its mental model of u (who u are, what u care about).",
        "off = AI doesnt accumulate a profile — fresh every session. on = it learns u over time.",
        "flip it. profile is in the User tab — u can review + edit anytime.",
    ),
    mode_suggested_replies: makeTooltip(
        "shows a 'u could say X' suggestion in the chat input after the AI replies.",
        "off = no suggestions appear. on = AI offers natural next-step prompts.",
        "flip it.",
    ),
    mode_banter: makeTooltip(
        "lets the AI roast u back when u start shit.",
        "off = AI stays polite no matter what. on = AI engages in mutual banter (data-driven, never fabricated).",
        "flip it. when on, the Banter concern in Persona shows up.",
    ),
    mode_inside_jokes: makeTooltip(
        "lets the AI use ur clans inside jokes naturally.",
        "off = AI doesnt use them. on = it weaves them into msgs without explaining.",
        "flip it.",
    ),
    mode_spontaneous_reactions: makeTooltip(
        "lets the AI react on its own to events (drops, deaths, milestones).",
        "off = AI is quiet unless u talk to it. on = it celebrates + commiserates as stuff happens.",
        "flip it. when on, the Reactions concern in Persona shows up.",
    ),
    mode_op_action: makeTooltip(
        "lets the AI run multi-step tasks (claim a clan, fill forms, navigate-then-act).",
        "off = AI cant chain dashboard actions. on = it handles 'claim X as Y' + similar.",
        "flip it. usually leave on if Dashboard actions is on.",
    ),
    mode_op_guide: makeTooltip(
        "lets the AI help u find sections + explain dashboard features.",
        "off = AI cant navigate or highlight UI on ur behalf. on = 'where is X' works.",
        "flip it.",
    ),
    mode_op_tracker: makeTooltip(
        "lets the AI pull player stats + leaderboards + ranks.",
        "off = AI doesnt fetch stat data. on = 'whats my xp/hr' works.",
        "flip it. needs DB queries also on.",
    ),
};
